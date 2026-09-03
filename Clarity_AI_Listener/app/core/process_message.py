
import json

import os

import tempfile

from app.utils.s3_utils import download_file_as_bytes, upload_content_to_s3, upload_bytes_to_s3

from app.utils.mongo_utils import (

    is_file_already_processed,

    update_status_processing,

    update_progress,

    update_status_completed,

    update_status_failed,

    update_status_stopped,

    get_file_status,

    get_source_file_encryption_metadata,

    get_transcript_file_encryption_metadata

)

from app.utils.encryption_service import encryption_service

from app.utils.audio_utils import (

    is_video_file,

    is_audio_file,

    extract_audio_from_video,

    get_file_size_mb,

    chunk_audio,

    merge_transcriptions,

    merge_segments,

    cleanup_chunks,

    CHUNK_SIZE_MB,

    CHUNK_DURATION_SECONDS

)

from app.llm.llm_controller import transcribe

from app.utils.logger import log_event

import traceback

 

class MessageProcessor:

    def __init__(self, message_body: str, mongo_collection):

        try:

            self.message = json.loads(message_body) if isinstance(message_body, str) else message_body

        except Exception as e:

            log_event("SYSTEM", "SYSTEM", f"Error parsing message: {e}")

            self.message = None

        self.mongo_collection = mongo_collection

        self.source_bucket = self.message.get('source_bucket')

        self.file_id = self.message.get('fileID')

        self.source_key = self.message.get('source_key')

        self.job_id = self.message.get('jobID')

        self.output_bucket = self.message.get('output_bucket')

        self.output_key = self.message.get('output_key')

        self.options = self.message.get('options', {})

 

    def verify_message(self) -> bool:

        """Verify that the message contains all required fields."""

        required_fields = ['jobID', 'fileID', 'source_bucket', 'source_key']

        for field in required_fields:

            if not self.message.get(field):

                log_event(self.job_id or "UNKNOWN", self.file_id or "UNKNOWN", f"Missing required field: {field}")

                return False

        return True

 

    def is_already_processed(self) -> bool:

        """Step 2: Idempotency check - check if jobID+fileID already processed."""

        return is_file_already_processed(self.job_id, self.file_id, self.mongo_collection)

 

    def process(self) -> bool:

        """

        Main processing workflow:

        1. Receive message (done in main.py)

        2. Idempotency check (jobID + fileID)

        3. Download file from S3

        4. Update status to uploaded

        5. Check if video or audio

        6. If video, extract audio

        7. Update status if required

        8. Chunk audio if > 10MB

        9. Update status to processing

        10. For each chunk: transcribe, update progress, remove overlap

        11. Merge chunks

        12. Upload transcript to S3

        13. Update status to completed

        14. Delete message (done in main.py)

        """

        if not self.verify_message():

            return False

       

        local_file_path = None

        extracted_audio_path = None

        chunks = []

       

        try:

            # Step 2: Idempotency check

            if self.is_already_processed():

                log_event(self.job_id, self.file_id, "Already processed, skipping")

                return True

           

            # Step 3: Download file from S3 as bytes

            log_event(self.job_id, self.file_id, f"Downloading file from s3://{self.source_bucket}/{self.source_key}")

            encrypted_bytes = download_file_as_bytes(self.source_bucket, self.source_key)

           

            # Step 4: Decrypt source file using metadata from MongoDB

            log_event(self.job_id, self.file_id, "Retrieving source file encryption metadata from MongoDB")

            source_encryption_metadata = get_source_file_encryption_metadata(self.job_id, self.file_id, self.mongo_collection)

           

            if source_encryption_metadata:

                log_event(self.job_id, self.file_id, "Decrypting source file with metadata")

                decrypted_bytes = encryption_service.decrypt_file_with_metadata(encrypted_bytes, source_encryption_metadata)

            else:

                log_event(self.job_id, self.file_id, "No source encryption metadata found, using legacy decryption")

                decrypted_bytes = encryption_service.decrypt_file_content(encrypted_bytes)

           

            # Save decrypted bytes to temp file with original extension (lowercase)

            filename = os.path.basename(self.source_key)

            name, ext = os.path.splitext(filename)

            filename_lower = name + ext.lower()

            local_file_path = os.path.join(tempfile.gettempdir(), filename_lower)

            with open(local_file_path, 'wb') as f:

                f.write(decrypted_bytes)

            log_event(self.job_id, self.file_id, f"Decrypted file saved to {local_file_path}")

            # Step 5: Check if video or audio file

            if is_video_file(local_file_path):

                # Step 6: Extract audio from video

                update_progress(self.job_id, self.file_id, 0, 1, "extracting_audio", self.mongo_collection)

                log_event(self.job_id, self.file_id, "Video file detected, extracting audio")

                extracted_audio_path = extract_audio_from_video(local_file_path)

                audio_to_process = extracted_audio_path

                # Step 7: Update status (optional - extraction complete)

                log_event(self.job_id, self.file_id, "Audio extraction completed")

            elif is_audio_file(local_file_path):

                audio_to_process = local_file_path

                log_event(self.job_id, self.file_id, "Audio file detected")

            else:

                raise Exception(f"Unsupported file format: {local_file_path}")

           

            # Step 8: Chunk audio if file size > limit OR duration > limit

            file_size = get_file_size_mb(audio_to_process)

            log_event(self.job_id, self.file_id, f"Audio file size: {file_size:.2f} MB")

           

            update_progress(self.job_id, self.file_id, 0, 1, "chunking", self.mongo_collection)

            chunks = chunk_audio(audio_to_process, CHUNK_SIZE_MB, CHUNK_DURATION_SECONDS)

            total_chunks = len(chunks)

            log_event(self.job_id, self.file_id, f"Audio split into {total_chunks} chunk(s)")

           

            # Step 9: Update status to processing

            update_status_processing(self.job_id, self.file_id, self.mongo_collection)

            update_progress(self.job_id, self.file_id, 0, total_chunks, "transcribing", self.mongo_collection)

            log_event(self.job_id, self.file_id, "Status updated to processing")

           

            # Step 10: Transcribe each chunk

            transcriptions = []

            segments_list = []

            transcription_stopped = False

           

            for i, (chunk_path, start_time, end_time) in enumerate(chunks):

                # Check file status before transcribing each chunk

                current_status = get_file_status(self.job_id, self.file_id, self.mongo_collection)

               

                if current_status == "Stopped":

                    log_event(self.job_id, self.file_id, f"Transcription stopped by user at chunk {i + 1}/{total_chunks}")

                    transcription_stopped = True

                    break

               

                log_event(self.job_id, self.file_id, f"Transcribing chunk {i + 1}/{total_chunks}")

               

                transcription_response = transcribe(chunk_path)

               

                if transcription_response.status_code != 200:

                    raise Exception(f"Transcription failed for chunk {i + 1}: {transcription_response.status_code} - {transcription_response.text}")

               

                transcription_result = transcription_response.json()

                transcriptions.append(transcription_result.get('text', ''))

                segments_list.append({'segments': transcription_result.get('segments', [])})

               

                # Update progress in MongoDB

                update_progress(self.job_id, self.file_id, i + 1, total_chunks, "transcribing", self.mongo_collection)

                log_event(self.job_id, self.file_id, f"Chunk {i + 1}/{total_chunks} completed")

           

            # If transcription was stopped, update status and return

            if transcription_stopped:

                update_status_stopped(self.job_id, self.file_id, self.mongo_collection)

                log_event(self.job_id, self.file_id, "Transcription stopped - status updated to Stopped")

                return True

           

            # Step 11: Merge chunks (overlap removal handled in merge_transcriptions)

            update_progress(self.job_id, self.file_id, total_chunks, total_chunks, "merging", self.mongo_collection)

            log_event(self.job_id, self.file_id, "Merging transcriptions")

            merged_transcription = merge_transcriptions(transcriptions, chunks)

           

            ### Encrypt transcript (convert string to bytes)

            transcription_bytes = merged_transcription.encode('utf-8') if isinstance(merged_transcription, str) else merged_transcription

            transcription_output, transcript_metadata = encryption_service.encrypt_file_with_metadata(transcription_bytes)

            log_event(self.job_id, self.file_id, "Transcript encrypted with metadata")

           

            # Merge segments with adjusted timestamps and IDs

            log_event(self.job_id, self.file_id, "Merging segments")

            merged_segments_dict = merge_segments(segments_list, chunks)

           

            ### Encrypt segments (convert dict to JSON bytes)

            segments_json_str = json.dumps(merged_segments_dict, indent=2)

            segments_bytes = segments_json_str.encode('utf-8')

            merged_segments, segments_metadata = encryption_service.encrypt_file_with_metadata(segments_bytes)

            log_event(self.job_id, self.file_id, "Segments encrypted with metadata")

 

            # Step 12: Upload transcript to S3

            if not self.output_key:

                base_name = os.path.splitext(self.source_key)[0]

                self.output_key = f"{base_name}_transcription.txt"

           

            if not self.output_bucket:

                self.output_bucket = self.source_bucket

           

            transcription_s3_uri = upload_bytes_to_s3(

                transcription_output,

                self.output_bucket,

                self.output_key

            )

            log_event(self.job_id, self.file_id, f"Transcript uploaded to {transcription_s3_uri}")

           

            # Upload segments JSON to S3

            segments_output_key = os.path.splitext(self.output_key)[0] + '.json'

            segments_s3_uri = upload_bytes_to_s3(

                merged_segments,

                self.output_bucket,

                segments_output_key

            )

            log_event(self.job_id, self.file_id, f"Segments uploaded to {segments_s3_uri}")

           

            # Step 13: Update status to completed with transcript and diarized encryption metadata

            update_progress(self.job_id, self.file_id, total_chunks, total_chunks, "completed", self.mongo_collection)

            update_status_completed(

                self.job_id,

                self.file_id,

                transcription_s3_uri,

                self.mongo_collection,

                transcript_encryption_metadata=transcript_metadata,

                diarized_encryption_metadata=segments_metadata

            )

            log_event(self.job_id, self.file_id, "Processing completed successfully with transcript and diarized encryption metadata stored")

           

            return True

           

        except Exception as e:

            error_message = str(e)

            log_event(self.job_id, self.file_id, f"Error: {error_message}")

            log_event(self.job_id, self.file_id, f"Traceback: {traceback.format_exc()}")

            update_status_failed(self.job_id, self.file_id, error_message, self.mongo_collection)

            return False

           

        finally:

            # Cleanup temporary files

            if chunks:

                cleanup_chunks(chunks, audio_to_process if 'audio_to_process' in dir() else "")

            if extracted_audio_path and os.path.exists(extracted_audio_path):

                os.remove(extracted_audio_path)

            if local_file_path and os.path.exists(local_file_path):

                os.remove(local_file_path)

                log_event(self.job_id, self.file_id, "Cleaned up temporary files")

 

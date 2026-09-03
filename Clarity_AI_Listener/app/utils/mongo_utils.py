
from app.config.conf import MongoConfig as mongoconf

from pymongo import MongoClient

from datetime import datetime

 

def get_mongo_collection():

    client = MongoClient(mongoconf.MONGO_URI, tlsAllowInvalidCertificates=True)

    db = client[mongoconf.MONGO_DB_NAME]

    collection = db[mongoconf.MONGO_COLLECTION_NAME]

    return collection

 

def is_file_already_processed(job_id: str, file_id: str, mongo_collection) -> bool:

    """Check if the combination of jobID and fileID is already processed."""

    job = mongo_collection.find_one(

        {"jobID": job_id, "files.fileID": file_id},

        {"files.$": 1}

    )

    if job and job.get("files"):

        file_status = job["files"][0].get("status", "")

        if file_status in ["completed", "processing"]:

            return True

    return False

 

def update_status_uploaded(job_id: str, file_id: str, mongo_collection) -> bool:

    """Update file status to uploaded after download from S3."""

    result = mongo_collection.update_one(

        {"jobID": job_id},

        {

            "$set": {

                "files.$[file].status": "uploaded",

 

            }

        },

        array_filters=[{"file.fileID": file_id}]

    )

    return result.acknowledged

 

def update_status_processing(job_id: str, file_id: str, mongo_collection) -> bool:

    """Update both job and file status to processing."""

    result = mongo_collection.update_one(

        {"jobID": job_id},

        {

            "$set": {

                "status": "processing",

                "timeDetails.startedProcessingAt": datetime.utcnow(),

                "files.$[file].status": "processing",

                "files.$[file].timeDetails.startedProcessingAt": datetime.utcnow()

            }

        },

        array_filters=[{"file.fileID": file_id}]

    )

    return result.acknowledged

 

def update_progress(job_id: str, file_id: str, current_chunk: int, total_chunks: int, stage: str, mongo_collection) -> bool:

    """

    Update file progress in MongoDB.

   

    Args:

        stage: One of 'extracting_audio', 'chunking', 'transcribing', 'merging', 'completed'

    """

    percentage = int((current_chunk / total_chunks) * 100) if total_chunks > 0 else 0

   

    result = mongo_collection.update_one(

        {"jobID": job_id},

        {

            "$set": {

                "files.$[file].progress.currentChunk": str(current_chunk),

                "files.$[file].progress.totalChunks": str(total_chunks),

                "files.$[file].progress.percentage": str(percentage),

                "files.$[file].progress.stage": stage

            }

        },

        array_filters=[{"file.fileID": file_id}]

    )

    return result.acknowledged

 

def update_status_completed(job_id: str, file_id: str, transcript_s3_uri: str, mongo_collection, transcript_encryption_metadata: dict = None, diarized_encryption_metadata: dict = None) -> bool:

    """Update file status to completed. Update job status only if all files are completed."""

    # First, update the file status to completed

    update_fields = {

        "files.$[file].status": "completed",

        "files.$[file].timeDetails.processedAt": datetime.utcnow(),

        "files.$[file].s3Details.transcriptFileName": transcript_s3_uri,

        "files.$[file].progress.percentage": "100"

    }

   

    # Add transcript encryption metadata if provided

    if transcript_encryption_metadata:

        update_fields["files.$[file].encryptionMetadata.transcriptFileName"] = transcript_encryption_metadata

   

    # Add diarized transcript encryption metadata if provided

    if diarized_encryption_metadata:

        update_fields["files.$[file].encryptionMetadata.transcriptDiarizedFile"] = diarized_encryption_metadata

   

    result = mongo_collection.update_one(

        {"jobID": job_id},

        {"$set": update_fields},

        array_filters=[{"file.fileID": file_id}]

    )

   

    # Check if all files are completed

    job = mongo_collection.find_one({"jobID": job_id}, {"files": 1})

    if job and job.get("files"):

        all_completed = all(f.get("status") == "completed" for f in job["files"])

        if all_completed:

            mongo_collection.update_one(

                {"jobID": job_id},

                {

                    "$set": {

                        "status": "completed",

                        "timeDetails.processedAt": datetime.utcnow()

                    }

                }

            )

   

    return result.acknowledged

 

def get_source_file_encryption_metadata(job_id: str, file_id: str, mongo_collection) -> dict:

    """Retrieve source file encryption metadata from MongoDB."""

    job = mongo_collection.find_one(

        {"jobID": job_id, "files.fileID": file_id},

        {"files.$": 1}

    )

    if job and job.get("files") and len(job["files"]) > 0:

        encryption_metadata = job["files"][0].get("encryptionMetadata", {})

        return encryption_metadata.get("sourceFileName")

    return None

 

def get_transcript_file_encryption_metadata(job_id: str, file_id: str, mongo_collection) -> dict:

    """Retrieve transcript file encryption metadata from MongoDB."""

    job = mongo_collection.find_one(

        {"jobID": job_id, "files.fileID": file_id},

        {"files.$": 1}

    )

    if job and job.get("files") and len(job["files"]) > 0:

        encryption_metadata = job["files"][0].get("encryptionMetadata", {})

        return encryption_metadata.get("transcriptFileName")

    return None

 

def get_diarized_file_encryption_metadata(job_id: str, file_id: str, mongo_collection) -> dict:

    """Retrieve diarized transcript file encryption metadata from MongoDB."""

    job = mongo_collection.find_one(

        {"jobID": job_id, "files.fileID": file_id},

        {"files.$": 1}

    )

    if job and job.get("files") and len(job["files"]) > 0:

        encryption_metadata = job["files"][0].get("encryptionMetadata", {})

        return encryption_metadata.get("transcriptDiarizedFile")

    return None

 

def get_file_status(job_id: str, file_id: str, mongo_collection) -> str:

    """Get current status of a file from MongoDB."""

    job = mongo_collection.find_one(

        {"jobID": job_id, "files.fileID": file_id},

        {"files.$": 1}

    )

    if job and job.get("files") and len(job["files"]) > 0:

        return job["files"][0].get("status", "")

    return ""

 

def update_status_failed(job_id: str, file_id: str, error_message: str, mongo_collection) -> bool:

    """Update status to Failed with error details."""

    result = mongo_collection.update_one(

        {"jobID": job_id},

        {

            "$set": {

                "status": "Failed",

                "files.$[file].status": "Failed",

                "files.$[file].error_details": error_message

            }

        },

        array_filters=[{"file.fileID": file_id}]

    )

    return result.acknowledged

 

def update_status_stopped(job_id: str, file_id: str, mongo_collection) -> bool:

    """Update status to Stopped when transcription is stopped by user."""

    result = mongo_collection.update_one(

        {"jobID": job_id},

        {

            "$set": {

                "files.$[file].status": "Stopped",

                "files.$[file].timeDetails.stoppedAt": datetime.utcnow()

            }

        },

        array_filters=[{"file.fileID": file_id}]

    )

    return result.acknowledged

 

if __name__ == "__main__":

    collection = get_mongo_collection()

    response = collection.find_one({"jobID": "123"})

    print(response)

 


 

import os

import subprocess

import tempfile

import math

from typing import List, Tuple

 

CHUNK_SIZE_MB = 10

CHUNK_DURATION_SECONDS = 600  # 10 minutes

OVERLAP_SECONDS = 5

SILENCE_THRESHOLD_DB = -40  # dB threshold for silence detection

MIN_SILENCE_DURATION = 0.5  # Minimum silence duration in seconds

 

VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']

AUDIO_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.wma']

 

def get_file_size_mb(file_path: str) -> float:

    """Get file size in megabytes."""

    return os.path.getsize(file_path) / (1024 * 1024)

 

def is_video_file(file_path: str) -> bool:

    """Check if file is a video file."""

    ext = os.path.splitext(file_path)[1].lower()

    return ext in VIDEO_EXTENSIONS

 

def is_audio_file(file_path: str) -> bool:

    """Check if file is an audio file."""

    ext = os.path.splitext(file_path)[1].lower()

    return ext in AUDIO_EXTENSIONS

 

def extract_audio_from_video(video_path: str) -> str:

    """

    Extract audio from video file using ffmpeg.

   

    Args:

        video_path: Path to video file

       

    Returns:

        Path to extracted WAV file

    """

    output_path = os.path.splitext(video_path)[0] + '.wav'

   

    cmd = [

        'ffmpeg', '-i', video_path,

        '-vn',  # No video

        '-acodec', 'pcm_s16le',  # PCM 16-bit

        '-ar', '16000',  # 16kHz sample rate

        '-ac', '1',  # Mono

        '-y',  # Overwrite output

        output_path

    ]

   

    subprocess.run(cmd, check=True, capture_output=True)

    return output_path

 

def get_audio_duration(file_path: str) -> float:

    """Get audio duration in seconds using ffprobe."""

    cmd = [

        'ffprobe', '-v', 'error',

        '-show_entries', 'format=duration',

        '-of', 'default=noprint_wrappers=1:nokey=1',

        file_path

    ]

   

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)

    return float(result.stdout.strip())

 

def detect_silence_points(file_path: str, silence_threshold_db: float = SILENCE_THRESHOLD_DB, min_silence_duration: float = MIN_SILENCE_DURATION) -> List[Tuple[float, float]]:

    """

    Detect silence points in audio file using ffmpeg silencedetect filter.

   

    Args:

        file_path: Path to audio file

        silence_threshold_db: Silence threshold in dB (e.g., -40)

        min_silence_duration: Minimum silence duration in seconds

       

    Returns:

        List of tuples (silence_start, silence_end) in seconds

    """

    cmd = [

        'ffmpeg', '-i', file_path,

        '-af', f'silencedetect=noise={silence_threshold_db}dB:d={min_silence_duration}',

        '-f', 'null', '-'

    ]

   

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    output = result.stderr

   

    silence_points = []

    silence_start = None

   

    for line in output.split('\n'):

        if 'silence_start' in line:

            try:

                silence_start = float(line.split('silence_start: ')[1].split()[0])

            except (IndexError, ValueError):

                continue

        elif 'silence_end' in line and silence_start is not None:

            try:

                silence_end = float(line.split('silence_end: ')[1].split()[0])

                silence_points.append((silence_start, silence_end))

                silence_start = None

            except (IndexError, ValueError):

                continue

   

    return silence_points

 

def chunk_audio(file_path: str, chunk_size_mb: float = CHUNK_SIZE_MB, chunk_duration_seconds: float = CHUNK_DURATION_SECONDS) -> List[Tuple[str, float, float]]:

    """

    Split audio file into chunks using VAD/silence detection for natural breakpoints.

    Hard limits: 10MB file size OR 10 minutes duration.

   

    Args:

        file_path: Path to audio file

        chunk_size_mb: Maximum chunk size in MB (hard limit)

        chunk_duration_seconds: Maximum chunk duration in seconds (hard limit)

       

    Returns:

        List of tuples (chunk_path, start_time, end_time)

    """

    file_size_mb = get_file_size_mb(file_path)

    duration = get_audio_duration(file_path)

   

    # Check if chunking is needed based on either file size OR duration

    needs_chunking = file_size_mb > chunk_size_mb or duration > chunk_duration_seconds

   

    if not needs_chunking:

        return [(file_path, 0.0, duration)]

   

    # Detect silence points for natural breakpoints

    silence_points = detect_silence_points(file_path)

   

    # Calculate bytes per second to estimate chunk sizes

    bytes_per_second = (file_size_mb * 1024 * 1024) / duration if duration > 0 else 0

   

    # Build chunks respecting hard limits and using silence points

    chunks = []

    temp_dir = tempfile.gettempdir()

    base_name = os.path.splitext(os.path.basename(file_path))[0]

   

    current_start = 0.0

    chunk_index = 0

   

    while current_start < duration:

        # Calculate max end time based on hard limits

        max_end_by_duration = current_start + chunk_duration_seconds

        max_end_by_size = current_start + (chunk_size_mb * 1024 * 1024 / bytes_per_second) if bytes_per_second > 0 else duration

        max_end = min(max_end_by_duration, max_end_by_size, duration)

       

        # Find the best silence point before max_end

        best_split_point = None

        for silence_start, silence_end in silence_points:

            silence_mid = (silence_start + silence_end) / 2

            # Look for silence points in the last 20% of the allowed chunk range

            if current_start + (max_end - current_start) * 0.8 <= silence_mid <= max_end:

                best_split_point = silence_mid

       

        # If no silence point found, use max_end (hard limit)

        chunk_end = best_split_point if best_split_point else max_end

       

        # Ensure we don't create tiny chunks at the end

        if duration - chunk_end < chunk_duration_seconds * 0.1:

            chunk_end = duration

       

        # Create the chunk

        chunk_path = os.path.join(temp_dir, f"{base_name}_chunk_{chunk_index}.wav")

        actual_duration = chunk_end - current_start

       

        cmd = [

            'ffmpeg', '-i', file_path,

            '-ss', str(current_start),

            '-t', str(actual_duration),

            '-acodec', 'pcm_s16le',

            '-ar', '16000',

            '-ac', '1',

            '-y',

            chunk_path

        ]

       

        subprocess.run(cmd, check=True, capture_output=True)

        chunks.append((chunk_path, current_start, chunk_end))

       

        current_start = chunk_end

        chunk_index += 1

   

    return chunks

 

def merge_transcriptions(transcriptions: List[dict], chunks: List[Tuple[str, float, float]]) -> str:

    """

    Merge transcriptions from multiple chunks.

    Since chunks are split at silence points (natural breakpoints), no overlap removal needed.

   

    Args:

        transcriptions: List of transcription results from each chunk

        chunks: List of (chunk_path, start_time, end_time) tuples

       

    Returns:

        Merged transcription text

    """

    if len(transcriptions) == 1:

        return transcriptions[0] if isinstance(transcriptions[0], str) else transcriptions[0].get('text', '')

   

    merged_text = []

   

    for transcription in transcriptions:

        text = transcription if isinstance(transcription, str) else transcription.get('text', '')

        merged_text.append(text)

   

    return ' '.join(merged_text)

 

def merge_segments(segments_list: List[dict], chunks: List[Tuple[str, float, float]]) -> dict:

    """

    Merge segments from multiple chunks, adjusting timestamps and IDs.

    Since chunks are split at silence points (natural breakpoints), all segments are included.

   

    Args:

        segments_list: List of segment dictionaries from each chunk (each containing 'segments' array)

        chunks: List of (chunk_path, start_time, end_time) tuples

       

    Returns:

        Dictionary with merged segments array

    """

    if len(segments_list) == 1:

        return segments_list[0]

   

    merged_segments = []

    segment_id_counter = 0

   

    for i, (segment_data, chunk_info) in enumerate(zip(segments_list, chunks)):

        chunk_segments = segment_data.get('segments', [])

        chunk_path, chunk_start_time, chunk_end_time = chunk_info

       

        for seg in chunk_segments:

            new_seg = seg.copy()

            new_seg['id'] = f"seg_{segment_id_counter}"

           

            # Adjust timestamps for all chunks except the first

            if i > 0:

                seg_start = seg.get('start', 0)

                seg_end = seg.get('end', 0)

                new_seg['start'] = seg_start + chunk_start_time

                new_seg['end'] = seg_end + chunk_start_time

           

            merged_segments.append(new_seg)

            segment_id_counter += 1

   

    return {"segments": merged_segments}

 

def cleanup_chunks(chunks: List[Tuple[str, float, float]], original_file: str):

    """Remove temporary chunk files."""

    for chunk_path, _, _ in chunks:

        if chunk_path != original_file and os.path.exists(chunk_path):

            os.remove(chunk_path)

 

 
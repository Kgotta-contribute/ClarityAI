
import boto3

import os

import tempfile

from app.config.conf import ENV

 

def get_s3_client():

    if ENV == 'local':

        return boto3.client(

            's3',

            endpoint_url='http://localhost:4566',

            region_name='us-east-1',

        aws_access_key_id='test',

        aws_secret_access_key='test',

    )

    return boto3.client(

        's3'

    )

 

def download_file_from_s3(bucket: str, key: str) -> str:

    """

    Download a file from S3 to local storage.

   

    Args:

        bucket: S3 bucket name

        key: S3 object key

        local_path: Optional local path to save file. If None, uses temp directory.

   

    Returns:

        Local file path where the file was downloaded

    """

    s3 = get_s3_client()

   

    filename = os.path.basename(key)

    local_path = os.path.join(tempfile.gettempdir(), filename)

   

    s3.download_file(bucket, key, local_path)

    return local_path

 

def download_file_as_bytes(bucket: str, key: str) -> bytes:

    """

    Download a file from S3 directly as bytes (for decryption, in-memory processing).

   

    Args:

        bucket: S3 bucket name

        key: S3 object key

   

    Returns:

        File content as bytes

    """

    s3 = get_s3_client()

    response = s3.get_object(Bucket=bucket, Key=key)

    return response['Body'].read()

 

def upload_file_to_s3(local_path: str, bucket: str, key: str) -> str:

    """

    Upload a file to S3.

   

    Args:

        local_path: Local file path to upload

        bucket: S3 bucket name

        key: S3 object key

   

    Returns:

        S3 URI of the uploaded file

    """

    s3 = get_s3_client()

    s3.upload_file(local_path, bucket, key)

    s3_uri = f"s3://{bucket}/{key}"

    return s3_uri

 

def upload_content_to_s3(content: str, bucket: str, key: str) -> str:

    """

    Upload string content directly to S3.

   

    Args:

        content: String content to upload

        bucket: S3 bucket name

        key: S3 object key

   

    Returns:

        S3 URI of the uploaded file

    """

    s3 = get_s3_client()

    s3.put_object(Body=content.encode('utf-8'), Bucket=bucket, Key=key)

    s3_uri = f"s3://{bucket}/{key}"

    return s3_uri

 

def upload_bytes_to_s3(content: bytes, bucket: str, key: str) -> str:

    """

    Upload bytes content directly to S3 (for encrypted data).

   

    Args:

        content: Bytes content to upload

        bucket: S3 bucket name

        key: S3 object key

   

    Returns:

        S3 URI of the uploaded file

    """

    s3 = get_s3_client()

    s3.put_object(Body=content, Bucket=bucket, Key=key)

    s3_uri = f"s3://{bucket}/{key}"

    return s3_uri

 

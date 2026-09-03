import boto3

from app.config.conf import ENV

 

def get_sqs_client():

    if ENV == 'local':

        return boto3.client(

            'sqs',

            endpoint_url='http://localhost:4566',

            region_name='us-east-1',

            aws_access_key_id='test',

            aws_secret_access_key='test',

        )

    return boto3.client(
        'sqs',
        region_name='us-east-1'
    )

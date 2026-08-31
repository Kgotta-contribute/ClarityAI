
import os

 

ENV = os.getenv('ENV', 'dev')

 

class AWSConfig:

    QUEUE_ENDPOINT_URL = os.getenv('AWS_QUEUE_ENDPOINT_URL', 'https://sqs.us-east-1.amazonaws.com/339713162907/voiceassist_carelon_uat_sqs_queue')

 

class MongoConfig:

    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')

    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'dtle2er-arrow-dev')

    MONGO_COLLECTION_NAME = os.getenv('MONGO_COLLECTION_NAME', 'clarityJobStatus')

 

class LLMConfig:

    LLM_CLIENT_ID = os.getenv('LLM_CLIENT_ID', 'test')

    LLM_CLIENT_SECRET = os.getenv('LLM_CLIENT_SECRET', 'test')

    LLM_TOKEN_URL = os.getenv('LLM_TOKEN_URL', 'https://api.horizon.elevancehealth.com/v2/oauth2/token')

 

class ProtegrityConfig:

    PROTEGRITY_URL = os.getenv('PROTEGRITY_URL', 'https://clarity-ai-dev.elevancehealth.com/protegrity')

 

 

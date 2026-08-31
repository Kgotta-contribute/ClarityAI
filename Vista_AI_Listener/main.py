from app.core.consumer import get_sqs_client

from app.core.process_message import MessageProcessor

from app.config.conf import AWSConfig as awsconf

from app.utils.mongo_utils import get_mongo_collection

from app.utils.logger import log_event

 

sqs = get_sqs_client()

queue_url = awsconf.QUEUE_ENDPOINT_URL

mongo_collection = get_mongo_collection()

 

def delete_message(receipt_handle: str):

    """Step 14: Delete message from SQS queue."""

    sqs.delete_message(

        QueueUrl=queue_url,

        ReceiptHandle=receipt_handle

    )

 

def main():

    """

    Main SQS listener loop.

    Step 1: Receive message from SQS queue

    """

    log_event("SYSTEM", "SYSTEM", "Starting SQS listener")

 

    while True:

        # Step 1: Receive message from SQS

        resp = sqs.receive_message(

            QueueUrl=queue_url,

            MaxNumberOfMessages=1,

            WaitTimeSeconds=10,

            MessageAttributeNames=['All']

        )

       

        messages = resp.get('Messages', [])

        if not messages:

            continue

       

        for message in messages:

            message_id = message['MessageId']

            receipt_handle = message['ReceiptHandle']

            log_event("SYSTEM", message_id, "Received message from SQS")

 

            try:

                # Create processor and run workflow (Steps 2-13)

                processor = MessageProcessor(message['Body'], mongo_collection)

                print(f"Processor created: {message['Body']}")

                # Check idempotency first

                if processor.is_already_processed():

                    log_event(processor.job_id, processor.file_id, "Already processed, skipping")

                    delete_message(receipt_handle)

                    continue

               

                # Process the message (Steps 3-13)

                success = processor.process()

               

                if success:

                    log_event(processor.job_id, processor.file_id, "Message processed successfully")

                else:

                    log_event(processor.job_id, processor.file_id, "Message processing failed")

               

            except Exception as e:

                log_event("SYSTEM", message_id, f"Error processing message: {e}")

           

            # Step 14: Delete message from SQS

            delete_message(receipt_handle)

            log_event("SYSTEM", message_id, "Message deleted from SQS")

 

if __name__ == "__main__":

    main()

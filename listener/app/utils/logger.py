

import json

import logging

from datetime import datetime

 

logging.basicConfig(

    level=logging.INFO,

    format='%(message)s'

)

logger = logging.getLogger(__name__)

 

def log_event(job_id: str, file_id: str, message: str):

    """

    Log an event in standard JSON format to console.

   

    Args:

        job_id: The job identifier

        file_id: The file identifier

        message: The log message

    """

    log_entry = {

        "job_id": job_id,

        "file_id": file_id,

        "message": message,

        "timestamp": datetime.utcnow().isoformat() + "Z"

    }

    logger.info(json.dumps(log_entry))

 

 

 
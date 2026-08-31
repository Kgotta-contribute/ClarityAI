
import requests

import os

from app.llm.auth_controller import auth_controller

 

cert_file_path = os.getenv("SSL_CERT_FILE", "./app/llm/root.pem")

 

TRANSCRIBE_URL = os.getenv("TRANSCRIBE_URL", "https://api.horizon.elevancehealth.com/v2/audio/transcribe")

 

def transcribe(audio_file_path: str):

    """

    Call transcription endpoint to transcribe audio file.

   

    Args:

        audio_file_path: Local path to the audio file

   

    Returns:

        Response object from the transcription API

    """

    token = auth_controller.get_access_token()

   

    headers = {

        "Authorization": f"Bearer {token}"

    }

    files = {

        'file': open(audio_file_path, 'rb')

    }

    payload = {

        "diarize": "true",

    }

   

    response = requests.post(

        url=TRANSCRIBE_URL,

        headers=headers,

        files=files,

        data=payload,

        verify=cert_file_path

    )

    return response

 

def transcribe_stream(audio_file_path: str):

    """

    Stream transcription output, yielding chunks as they arrive.

   

    Args:

        audio_file_path: Local path to the audio file

   

    Yields:

        Chunks of transcription data as they arrive

    """

    token = auth_controller.get_access_token()

   

    headers = {

        "Authorization": f"Bearer {token}"

    }

    files = {

        'file': open(audio_file_path, 'rb')

    }

    payload = {

        'stream': "true",

        "diarize": "true",

    }

   

    response = requests.post(

        url=TRANSCRIBE_URL,

        headers=headers,

        files=files,

        data=payload,

        verify=cert_file_path,

        stream=True

    )

   

    print(f"Transcription stream response status: {response.status_code}")

   

    if response.status_code == 200:

        for chunk in response.iter_lines():

            if chunk:

                yield chunk

    else:

        yield {"error": f"Error in transcription: {response.status_code}", "details": response.text}

 

 


import time

import requests

import os

from app.config.conf import LLMConfig as llmconf

 

cert_file_path = os.getenv("SSL_CERT_FILE", "./app/llm/root.pem")

os.environ["SSL_CERT_FILE"] = cert_file_path

 

class AuthController:

    _instance = None

   

    def __new__(cls, *args, **kwargs):

        if cls._instance is None:

            cls._instance = super().__new__(cls)

            cls._instance._initialized = False

        return cls._instance

   

    def __init__(self, client_id: str = None, client_secret: str = None, token_url: str = None):

        if self._initialized:

            return

        self.client_id = llmconf.LLM_CLIENT_ID

        self.client_secret = llmconf.LLM_CLIENT_SECRET

        self.token_url = llmconf.LLM_TOKEN_URL

        self.access_token = None

        self.token_expiry = 0

        self._initialized = True

   

    def get_access_token(self) -> str:

        """Get a valid access token, refreshing if necessary."""

        try:

            if not self.client_secret:

                raise Exception("Client secret is not set. Please set LLM_CLIENT_SECRET env var.")

           

            if time.time() < self.token_expiry and self.access_token:

                return self.access_token

           

            headers = {

                "Content-Type": "application/json",

                "Access-Control-Allow-Credentials": "true"

            }

            payload = {

                "client_id": self.client_id,

                "client_secret": self.client_secret,

                "grant_type": "client_credentials"

            }

           

            res = requests.post(url=self.token_url, headers=headers, json=payload, verify=cert_file_path)

           

            if res.status_code == 200:

                self.access_token = res.json().get("access_token")

                self.token_expiry = time.time() + res.json().get("expires_in", 3600) - 60

                return self.access_token

            else:

                raise Exception(f"Error getting access token: {res.status_code} - {res.text}")

               

        except Exception as e:

            print(f"Auth error: {e}")

            raise

 

auth_controller = AuthController()

 

 

 

 

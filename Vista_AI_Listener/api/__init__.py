
from fastapi import FastAPI, Response

from fastapi.middleware.cors import CORSMiddleware

from starlette.middleware.base import BaseHTTPMiddleware

from starlette.requests import Request

 

app = FastAPI(title="CLARITY-AI-LISTENER API")

 

class SecureHeadersMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        response = await call_next(request)

        response.headers["X-Frame-Options"] = "DENY"

        response.headers["X-Content-Type-Options"] = "nosniff"

        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        response.headers["Content-Security-Policy"] = "default-src 'self'"

        return response

 

app.add_middleware(SecureHeadersMiddleware)

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)

 

@app.get("/secure")

async def set_secure_cookie():

    response = Response(content="Secure")

    response.set_cookie(key="spam", value="eggs", secure=True, httponly=True)

    return response

 

@app.post("/ping", tags=["Check Alive"])

async def ping():

    """

    Check if API Alive

   

    Returns:

        JSON response with status

    """

    return {"status": "Alive"}

 

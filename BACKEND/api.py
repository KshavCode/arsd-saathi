from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from extract import ARSDApp
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial
import uuid
from dotenv import load_dotenv
import os

load_dotenv()

# This tracks users by their IP address
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

# Connect the limiter to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DEFINE YOUR SHARED API KEY ---
API_SECRET_KEY = os.getenv("API_KEY") 

@app.get("/")
def health_check():
    return {"status": "ok", "message": "ArsdSaathi API is running"}

async def verify_api_key(x_api_key: str = Header(None)):
    """Rejects requests that don't have the correct header key"""
    if x_api_key != API_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid API Key")

class LoginRequest(BaseModel):
    name: str
    rollNo: str
    dob: str

executor = ThreadPoolExecutor(max_workers=3)

async def run_in_thread(func, *args, **kwargs):
    loop = asyncio.get_running_loop()
    pfunc = partial(func, *args, **kwargs)
    return await loop.run_in_executor(executor, pfunc)

def _get_all_data_sync(name, rollno, dob):
    app_instance = None
    try:
        # headless=True is essential for server deployment
        app_instance = ARSDApp(name, rollno, dob, headless=True)
        return app_instance.get_all_data()
    finally:
        if app_instance: app_instance.safe_quit()

# --- 3. PROTECT THE LOGIN ROUTE ---
@app.post("/api/login")
@limiter.limit("5/minute")  
async def login_and_fetch_all(
    request: Request,            
    login_data: LoginRequest, 
    authorized: bool = Depends(verify_api_key) 
):
    print(f"Login Attempt: {login_data.name} ({login_data.rollNo})")
    
    result = await run_in_thread(_get_all_data_sync, login_data.name, login_data.rollNo, login_data.dob)
    
    if not result["success"]:
        return {"success": False, "message": "Invalid Credentials or Login Failed"}
    
    return {
        "success": True,
        "token": str(uuid.uuid4()),
        "data": result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from extract import ARSDApp
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial
import uuid

# We can keep workers low, but since it's 1 session per user, it's faster now.
executor = ThreadPoolExecutor(max_workers=3)

class LoginRequest(BaseModel):
    name: str
    rollNo: str
    dob: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def run_in_thread(func, *args, **kwargs):
    loop = asyncio.get_running_loop()
    pfunc = partial(func, *args, **kwargs)
    return await loop.run_in_executor(executor, pfunc)

def _get_all_data_sync(name, rollno, dob):
    app_instance = None
    try:
        app_instance = ARSDApp(name, rollno, dob, headless=True)
        return app_instance.get_all_data()
    finally:
        if app_instance: app_instance.safe_quit()

@app.post("/api/login")
async def login_and_fetch_all(request: LoginRequest):
    print(f"Login & Fetch All: {request.name}")
    
    # This runs the single-session scraper
    result = await run_in_thread(_get_all_data_sync, request.name, request.rollNo, request.dob)
    
    if not result["success"]:
        return {"success": False, "message": "Invalid Credentials or Login Failed"}
    
    return {
        "success": True,
        "token": str(uuid.uuid4()), # Mock token
        "data": result # Contains all 4 dictionaries
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
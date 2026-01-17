from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException






# Reusing the functions and ARSDApp class already written
import sys
sys.path.append('..')  
from SCRIPTS.main import ARSDApp  


app = FastAPI(
    tags = ["FastAPI endpoints for ARSD app"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/login")
def login(data: dict):
    try:
        app_instance = ARSDApp(data["name"], data["rollNo"], data["password"], headless=True)
        success = app_instance.login()
        app_instance.driver.quit()
        print("LOGIN RESULT FROM CLASS:", success)

        if not success:
            return {"success": False, "message": "Invalid credentials"}
        return {"success": True, "message": "Login successful"}
    
            

    except Exception as e:
        return {"success": False, "message": "Invalid credentials"}




@app.post("/api/get_attendance")
def get_attendance(data: dict):
    try:
        app_instance = ARSDApp(data["name"], data["rollNo"], data["password"], headless=True)
        report_found = app_instance.get_attendance()
        return {
            "success": True,
            "report_found": report_found,
            "message": "Attendance report found" if report_found else "Attendance report not found"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/get_faculty_details")
def get_faculty_details(data: dict):
    
    try:
        app_instance = ARSDApp(data["name"], data["rollNo"], data["password"], headless=True)
        report_found = app_instance.get_faculty_details()
        
        return {
            "success": True,
            "data": report_found,
            
            "message": "Faculty details found"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   


@app.post("/api/get_mentor_name")
def get_mentor_name(data: dict):
    
    try:
        app_instance = ARSDApp(data["name"], data["rollNo"], data["password"], headless=True)
        mentorName = app_instance.get_mentor_name()
        
        return {
            "success": True,
            "mentor_name": mentorName,
            "message": "Mentor found"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.post("/api/get_basic_details")
def get_basic_details(data: dict):
    
    try:
        
        app_instance = ARSDApp(data["name"], data["rollNo"], data["password"], headless=True)
        basic_details =  app_instance.get_basic_details()
        
        
        return {
            "success": True,
            "data": basic_details,
            "message": "Basic details found"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
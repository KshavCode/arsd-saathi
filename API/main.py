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


# def get_driver():
#     chrome_options = Options()
#     chrome_options.add_argument('--headless')
#     chrome_options.add_argument("--start-maximized")
#     chrome_options.add_argument("--disable-popup-blocking")
#     chrome_options.add_argument('--disable-gpu')
#     chrome_options.add_argument('--no-sandbox')
#     chrome_options.add_argument('--disable-dev-shm-usage')
#     chrome_options.add_argument('--disable-extensions')
#     chrome_options.add_argument('--disable-logging')
#     chrome_options.add_argument('--log-level=3')
#     chrome_options.add_argument('--silent')
#     chrome_options.set_capability("pageLoadStrategy", "eager")
#     return webdriver.Chrome(options=chrome_options)


# def do_login(driver, name, rollNo, password):
#     wait = WebDriverWait(driver, 10)
#     url = "https://www.arsdcollege.in/Internet/Student/Login.aspx"
#     driver.get(url)
    
#     rollNo_element = wait.until(EC.presence_of_element_located((By.ID, "txtrollno")))
#     name_element = wait.until(EC.presence_of_element_located((By.ID, "txtname")))
#     password_element = wait.until(EC.presence_of_element_located((By.ID, "txtpassword")))
#     submitBtn_element = wait.until(EC.element_to_be_clickable((By.ID, "btnsearch")))
    
#     rollNo_element.clear()
#     rollNo_element.send_keys(rollNo)
#     name_element.clear()
#     name_element.send_keys(name)
#     password_element.clear()
#     password_element.send_keys(password)
#     submitBtn_element.click()




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


# @app.post("/api/login")
# def login(data: dict):
#     driver = get_driver()
#     try:
#         do_login(driver, data["name"], data["rollNo"], data["password"])
        
#         try:
#             WebDriverWait(driver, 3).until(
#                 EC.url_changes("https://www.arsdcollege.in/Internet/Student/Login.aspx")
#             )
#             return {"success": True, "message": "Login successful"}
#         except TimeoutException:
#             return {"success": False, "message": "Invalid credentials"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         driver.quit()

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

# @app.post("/api/get_attendance")
# def get_attendance(data: dict):
#     driver = get_driver()
#     try:
#         do_login(driver, data["name"], data["rollNo"], data["password"])
#         wait = WebDriverWait(driver, 10)
        
#         attendance_url = "https://www.arsdcollege.in/Internet/Student/Attendance_Report_Monthly.aspx"
#         driver.get(attendance_url)
        
#         select_element = wait.until(EC.element_to_be_clickable((By.ID, "ddlpapertype")))
#         select = Select(select_element)
#         try:
#             select.select_by_value("'TE'")
#         except:
#             pass
        
#         submitBtn_element = wait.until(EC.element_to_be_clickable((By.ID, "btnsearch")))
#         submitBtn_element.click()
        
#         try:
#             notFound_element = WebDriverWait(driver, 3).until(
#                 EC.presence_of_element_located((By.ID, "lblmsg"))
#             )
#             if notFound_element.text:
#                 return {"success": True, "report_found": False, "message": "Attendance report not found"}
#             else:
#                 return {"success": True, "report_found": True, "message": "Attendance report found"}
#         except TimeoutException:
#             return {"success": True, "report_found": True, "message": "Attendance report found"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         driver.quit()




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
   



# @app.post("/api/get_faculty_details")
# def get_faculty_details(data: dict):
#     driver = get_driver()
#     try:
#         do_login(driver, data["name"], data["rollNo"], data["password"])
#         wait = WebDriverWait(driver, 10)
        
#         details_url = "https://www.arsdcollege.in/Internet/Student/Check_Student_Faculty_Details.aspx"
#         driver.get(details_url)
        
#         table_element = wait.until(EC.presence_of_element_located((By.ID, "gvshow")))
#         rows = table_element.find_elements(By.TAG_NAME, "tr")
#         row_headers = [header.text for header in rows[0].find_elements(By.TAG_NAME, "th")]
        
#         faculty_data = {row_headers[i]: [] for i in range(len(row_headers))}
#         for row in rows[1:]:
#             cols = row.find_elements(By.TAG_NAME, "td")
#             for i in range(len(cols)):
#                 faculty_data[row_headers[i]].append(cols[i].text)
        
#         return {
#             "success": True,
#             "data": faculty_data,
#             "count": len(rows) - 1,
#             "message": "Faculty details found""
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         driver.quit()




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
    



# @app.post("/api/get_mentor_name")
# def get_mentor_name(data: dict):
#     driver = get_driver()
#     try:
#         do_login(driver, data["name"], data["rollNo"], data["password"])
#         wait = WebDriverWait(driver, 10)
        
#         details_url = "https://www.arsdcollege.in/Internet/Student/Mentor_Details.aspx"
#         driver.get(details_url)
        
#         mentor_element = wait.until(EC.presence_of_element_located((By.ID, "lblmentor_name")))
#         mentor_name = mentor_element.text
        
#         return {
#             "success": True,
#             "mentor_name": mentor_name,
#             "message": "Mentor details found"
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         driver.quit()



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
   







# @app.post("/api/get_basic_details")
# def get_basic_details(data: dict):
#     driver = get_driver()
#     try:
#         do_login(driver, data["name"], data["rollNo"], data["password"])
#         wait = WebDriverWait(driver, 10)
        
#         details_url = "https://www.arsdcollege.in/Internet/Student/STD_Basic_Details.aspx"
#         driver.get(details_url)
        
#         enrollnum = wait.until(EC.presence_of_element_located((By.ID, "lbleno"))).text
#         fathername = wait.until(EC.presence_of_element_located((By.ID, "lblfname"))).text
#         course_code = wait.until(EC.presence_of_element_located((By.ID, "lblcoursecode"))).text
#         course_name = wait.until(EC.presence_of_element_located((By.ID, "lblcoursename"))).text
#         part = wait.until(EC.presence_of_element_located((By.ID, "lblpart"))).text
#         sem = wait.until(EC.presence_of_element_located((By.ID, "lblsem"))).text
#         mobile = wait.until(EC.presence_of_element_located((By.ID, "lblmobileno"))).text
#         email = wait.until(EC.presence_of_element_located((By.ID, "lblemail"))).text
#         address = wait.until(EC.presence_of_element_located((By.ID, "lbladdress_local"))).text
        
#         basic_details = {
#             "name": data["name"],
#             "rollNo": data["rollNo"],
#             "course": f"{course_code} - {course_name}",
#             "enrollmentNumber": enrollnum,
#             "fatherName": fathername,
#             "year": f"{part}, Semester {sem}",
#             "mobile": mobile,
#             "email": email,
#             "address": address
#         }
        
#         return {
#             "success": True,
#             "data": basic_details,
#             "message": "Basic details found"
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         driver.quit()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
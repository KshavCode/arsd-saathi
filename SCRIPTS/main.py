from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException
from dotenv import load_dotenv
import os

from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


class ARSDApp:
    """Single-class refactor of the ARSD attendance script.

    Methods:
    - get_attendance(): performs login and checks monthly attendance report.
    - get_faculty_details(): placeholder for user implementation.
    """

    def __init__(self, name: str, rollNo: str, password: str, headless: bool = False):
        self.name = name
        self.rollNo = rollNo
        self.password = password

        self.chrome_options = Options()
        if headless:
            self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument("--start-maximized")
        self.chrome_options.add_argument("--disable-popup-blocking")
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-extensions')
        self.chrome_options.add_argument('--disable-logging')
        self.chrome_options.add_argument('--log-level=3')
        self.chrome_options.add_argument('--silent')
        self.chrome_options.set_capability("pageLoadStrategy", "eager")

        # self.driver = webdriver.Chrome(options=self.chrome_options)
        self.driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=self.chrome_options
)
        self.wait = WebDriverWait(self.driver, 10)
        self.url = "https://www.arsdcollege.in/Internet/Student/Login.aspx"

    def login(self):
        """Open the login page and submit credentials."""
        self.driver.get(self.url)

        rollNo_element = self.wait.until(EC.presence_of_element_located((By.ID, "txtrollno")))
        name_element = self.wait.until(EC.presence_of_element_located((By.ID, "txtname")))
        password_element = self.wait.until(EC.presence_of_element_located((By.ID, "txtpassword")))
        submitBtn_element = self.wait.until(EC.element_to_be_clickable((By.ID, "btnsearch")))

        rollNo_element.clear()
        rollNo_element.send_keys(self.rollNo)
        name_element.clear()
        name_element.send_keys(self.name)
        password_element.clear()
        password_element.send_keys(self.password)
        submitBtn_element.click()

         # 🔍 Give page time to react
        self.driver.implicitly_wait(3)

        # 🔎 If login form still exists → login failed
        try:
            self.driver.find_element(By.ID, "txtrollno")
            return False
        except:
            # Login form gone → success
            return True

    def get_attendance(self) -> bool:
        """Login and check for the monthly attendance report.

        Returns True if a report is found, False otherwise.
        The method prints the outcome and always quits the browser before returning.
        """
        try:
            self.login()

            attendance_url = "https://www.arsdcollege.in/Internet/Student/Attendance_Report_Monthly.aspx"
            self.driver.get(attendance_url)

            select_element = self.wait.until(EC.element_to_be_clickable((By.ID, "ddlpapertype")))
            select = Select(select_element)
            try:
                select.select_by_value("'TE'")
            except Exception:
                # best-effort: if value selection fails, proceed without raising
                pass

            submitBtn_element = self.wait.until(EC.element_to_be_clickable((By.ID, "btnsearch")))
            submitBtn_element.click()

            try:
                notFound_element = WebDriverWait(self.driver, 3).until(
                    EC.presence_of_element_located((By.ID, "lblmsg"))
                )
                if notFound_element.text:
                    print("Attendance report not found")
                    return False
                else:
                    print("Attendance report found")
                    return True
            except TimeoutException:
                # no 'not found' message appeared within the short window — assume success
                print("Attendance report found")
                return True
        finally:
            # ensure the browser is closed in all cases
            try:
                self.driver.quit()
            except Exception:
                pass

    def get_faculty_details(self):
        """Retrieve faculty details from the college website."""
        try: 
            self.login()
            details_url = "https://www.arsdcollege.in/Internet/Student/Check_Student_Faculty_Details.aspx"
            self.driver.get(details_url)
            table_element = self.wait.until(EC.presence_of_element_located((By.ID, "gvshow")))
            rows = table_element.find_elements(By.TAG_NAME, "tr")
            row_headers = [header.text for header in rows[0].find_elements(By.TAG_NAME, "th")]
            faculty_data = {row_headers[i]: [] for i in range(len(row_headers))}
            for row in rows[1:]:
                cols = row.find_elements(By.TAG_NAME, "td")
                for i in range(len(cols)):
                    faculty_data[row_headers[i]].append(cols[i].text)
            print(f"Found {len(rows)-1} faculty details (excluding header).")
            return faculty_data
        finally:
            try:
                self.driver.quit()
            except Exception:
                pass

    def get_mentor_name(self):
        try: 
            self.login()
            details_url = "https://www.arsdcollege.in/Internet/Student/Mentor_Details.aspx"
            self.driver.get(details_url)
            mentor_element = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.ID, "lblmentor_name")))
            mentor_name = mentor_element.text.strip()
            return mentor_name if mentor_name else None
            print(f"Mentor Name: {mentor_name}")
        finally:
            try:
                self.driver.quit()
            except Exception:
                pass
    def get_basic_details(self) :
        try: 
            self.login()
            details_url = "https://www.arsdcollege.in/Internet/Student/STD_Basic_Details.aspx"
            self.driver.get(details_url)
            name_element = self.name
            rollno_element = self.rollNo
            enrollnum_element = self.wait.until(EC.presence_of_element_located((By.ID, "lbleno"))).text
            enrollnum_element = self.wait.until(EC.presence_of_element_located((By.ID, "lbleno"))).text
            fathername_element = self.wait.until(EC.presence_of_element_located((By.ID, "lblfname"))).text
            course_element = self.wait.until(EC.presence_of_element_located((By.ID, "lblcoursecode"))).text + " - " + self.wait.until(EC.presence_of_element_located((By.ID, "lblcoursename"))).text
            year_element = self.wait.until(EC.presence_of_element_located((By.ID, "lblpart"))).text + ", Semester " + self.wait.until(EC.presence_of_element_located((By.ID, "lblsem"))).text
            mobile_element = self.wait.until(EC.presence_of_element_located((By.ID, "lblmobileno"))).text
            email_element = self.wait.until(EC.presence_of_element_located((By.ID, "lblemail"))).text
            address_element = self.wait.until(EC.presence_of_element_located((By.ID, "lbladdress_local"))).text
            
            basic_details = {
                "name": name_element,
                "rollNo": rollno_element,
                "course": course_element,
                "enrollmentNumber": enrollnum_element,
                "fatherName": fathername_element,
                "year": year_element,
                "mobile": mobile_element,
                "email": email_element,
                "address": address_element
            }
            print(f"Basic Details: {basic_details}")
            return basic_details
        finally:
            try:
                self.driver.quit()
            except Exception:
                pass
    
def main():
    load_dotenv()
    rollNo = os.getenv('ROLL_NO')
    name = os.getenv('NAME')
    password = os.getenv('PASSWORD')

    app = ARSDApp(name, rollNo, password)
    app.get_basic_details()

if __name__ == "__main__":
    main()

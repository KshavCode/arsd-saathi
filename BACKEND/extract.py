from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import os
from dotenv import load_dotenv
import time 

class ARSDApp:
    def __init__(self, name: str, rollNo: str, dob: str, headless: bool = False):
        self.name = name
        self.rollNo = rollNo
        self.dob = dob

        self.chrome_options = Options()
        if headless:
            self.chrome_options.add_argument('--headless=new')
        
        # --- ☢️ NUCLEAR RAM SAVING FLAGS (For Render Free Tier) ---
        # These are critical to stop the 300s crashes on 512MB RAM
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--disable-extensions')
        self.chrome_options.add_argument('--disable-infobars')
        self.chrome_options.add_argument('--dns-prefetch-disable')
        self.chrome_options.add_argument('--disable-browser-side-navigation')
        self.chrome_options.add_argument('--disable-software-rasterizer')
        
        # FORCE Single Process (Crucial for low RAM)
        self.chrome_options.add_argument('--renderer-process-limit=1')
        self.chrome_options.add_argument('--single-process') 
        self.chrome_options.add_argument('--no-zygote')
        
        # Block heavy assets at the engine level
        prefs = {
            "profile.managed_default_content_settings.images": 2,
            "profile.managed_default_content_settings.fonts": 2,
            "profile.default_content_setting_values.notifications": 2,
            "profile.managed_default_content_settings.stylesheets": 2, # Block CSS
        }
        self.chrome_options.add_experimental_option("prefs", prefs)
        self.chrome_options.add_argument('--blink-settings=imagesEnabled=false')
        
        # Don't wait for full page load (Speed boost)
        self.chrome_options.set_capability("pageLoadStrategy", "eager")
        self.chrome_options.add_argument("--window-size=1280,720") # Smaller window = Less RAM

        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=self.chrome_options
        )
        
        # OPTIMIZED TIMEOUTS: Fail fast instead of hanging for 30s
        self.wait = WebDriverWait(self.driver, 15) 
        self.short_wait = WebDriverWait(self.driver, 3) 
        self.url = "https://www.arsdcollege.in/Internet/Student/Login.aspx"

    def smart_select(self, select_element, value):
        select = Select(select_element)
        try:
            select.select_by_value(value)
        except NoSuchElementException:
            try:
                if value.startswith('0'):
                    alt_value = value.lstrip('0')
                else:
                    alt_value = value.zfill(2)
                select.select_by_value(alt_value)
            except Exception as e:
                # print(f"Selection Error: {value}. {e}")
                pass # Silence errors in production

    def login(self):
        try:
            self.driver.get(self.url)

            try:
                self.wait.until(EC.presence_of_element_located((By.ID, "txtrollno"))).send_keys(self.rollNo)
                self.driver.find_element(By.ID, "txtname").send_keys(self.name)
            except TimeoutException:
                print("Login Error: Fields not found")
                return False

            try:
                day, month, year = self.dob.split('-')
            except ValueError:
                return False

            selects = self.wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "select")))
            if len(selects) >= 4:
                self.smart_select(selects[1], day)
                self.smart_select(selects[2], month)
                self.smart_select(selects[3], year)
            else:
                return False

            try:
                self.driver.find_element(By.ID, "btnsearch").click()
            except NoSuchElementException:
                self.driver.find_element(By.XPATH, "//input[@type='submit']").click()

            try:
                # Wait for URL change to confirm login
                WebDriverWait(self.driver, 5).until(lambda d: "Login.aspx" not in d.current_url)
                return True
            except TimeoutException:
                return False

        except Exception as e:
            print(f"Login Failed: {e}")
            return False

    def _scrape_attendance(self):
        try:
            self.driver.get("https://www.arsdcollege.in/Internet/Student/Attendance_Report_Monthly.aspx")
            
            try:
                select_element = self.short_wait.until(EC.element_to_be_clickable((By.ID, "ddlpapertype")))
                Select(select_element).select_by_value("'TE'")
                self.driver.find_element(By.ID, "btnsearch").click()
            except:
                pass 

            try:
                if self.driver.find_elements(By.ID, "lblmsg"):
                    if self.driver.find_element(By.ID, "lblmsg").text.strip():
                        return {}
            except: pass

            try:
                table = self.short_wait.until(EC.presence_of_element_located((By.ID, "gvshow")))
                rows = table.find_elements(By.TAG_NAME, "tr")
                if len(rows) < 2: return {}

                headers = [h.text.strip() for h in rows[0].find_elements(By.TAG_NAME, "th")]
                attendance_data = {}

                for row in rows[1:]:
                    cols = row.find_elements(By.TAG_NAME, "td")
                    if not cols: continue
                    row_data = {headers[i]: cols[i].text.strip() for i in range(len(cols)) if i < len(headers)}
                    
                    subject_key = next((k for k in row_data.keys() if 'Paper' in k or 'Subject' in k), "General")
                    subject_name = row_data.get(subject_key, "General")
                    
                    if subject_name not in attendance_data: attendance_data[subject_name] = []
                    attendance_data[subject_name].append(row_data)

                return attendance_data
            except TimeoutException:
                return {}
        except Exception:
            return {}

    def _scrape_faculty(self):
        try:
            self.driver.get("https://www.arsdcollege.in/Internet/Student/Check_Student_Faculty_Details.aspx")
            try:
                if not self.driver.find_elements(By.ID, "gvshow"):
                    return []
                    
                table = self.driver.find_element(By.ID, "gvshow")
                rows = table.find_elements(By.TAG_NAME, "tr")
                if len(rows) == 0: return []
                
                headers = [h.text.strip() for h in rows[0].find_elements(By.TAG_NAME, "th")]
                faculty_list = []
                for row in rows[1:]:
                    cols = row.find_elements(By.TAG_NAME, "td")
                    row_dict = {}
                    for i in range(len(cols)):
                        if i < len(headers): row_dict[headers[i]] = cols[i].text.strip()
                    faculty_list.append(row_dict)
                return faculty_list
            except:
                return []
        except Exception:
            return []

    def _scrape_mentor(self):
        try:
            self.driver.get("https://www.arsdcollege.in/Internet/Student/Mentor_Details.aspx")
            return self.short_wait.until(EC.presence_of_element_located((By.ID, "lblmentor_name"))).text.strip()
        except:
            return None

    def _scrape_basic_details(self):
        try:
            self.driver.get("https://www.arsdcollege.in/Internet/Student/STD_Basic_Details.aspx")
            self.short_wait.until(EC.presence_of_element_located((By.ID, "lbleno")))
            
            def get_text(eid):
                try: return self.driver.find_element(By.ID, eid).text.strip()
                except: return ""

            return {
                "name": self.name,
                "rollNo": self.rollNo,
                "enrollmentNumber": get_text("lbleno"),
                "fatherName": get_text("lblfname"),
                "course": get_text("lblcoursecode") + " - " + get_text("lblcoursename"),
                "year": get_text("lblpart") + ", Semester " + get_text("lblsem"),
                "mobile": get_text("lblmobileno"),
                "email": get_text("lblemail"),
                "address": get_text("lbladdress_local")
            }
        except:
            return None

    def get_all_data(self):
        start_time = time.time()
        data = {
            "success": False,
            "attendance": {},
            "faculty": [],
            "mentor": None,
            "basic_details": None
        }

        try:
            if self.login():
                data["success"] = True
                print("Login Success. Fetching...")
                
                # Fetch sequence optimized for importance
                data["basic_details"] = self._scrape_basic_details()
                data["attendance"] = self._scrape_attendance()
                
                # If you STILL get 300s timeouts, comment out these next two lines:
                data["faculty"] = self._scrape_faculty()
                data["mentor"] = self._scrape_mentor()
            else:
                print("Login Failed")
        finally:
            self.safe_quit()
            
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"⏱️  Data extraction completed in {elapsed_time:.2f} seconds")
        return data

    def safe_quit(self):
        try:
            if hasattr(self, 'driver'):
                self.driver.quit()
        except:
            pass
        
        # ⚠️ LINUX ONLY: Force kill any "Zombie" Chrome processes to save RAM
        try:
            import os
            os.system("pkill -f chrome")
            os.system("pkill -f chromedriver")
        except:
            pass

if __name__ == '__main__':
    # Test block
    load_dotenv()
    # Ensure headless=True for server testing, but False for local if you want to see
    app = ARSDApp(name=os.getenv("NAME"), rollNo=os.getenv("ROLL_NO"), dob=os.getenv("DOB"), headless=False)
    print(app.get_all_data())
# ArsdSaathi
## Description
ArsdSaathi is a small automation utility that logs into the ARSD College student portal and retrieves the monthly attendance report. It is implemented in Python using Selenium and is provided as a single `ARSDApp` class with methods to get attendance and (placeholder) faculty details.

## Features
- **Login & Attendance**: Automates login and checks the monthly attendance report using `ARSDApp.get_attendance()`.


## Requirements
- **Python**: 3.8+
- **Selenium**: Browser automation library
- **Chrome** and a matching **ChromeDriver** (or another webdriver of your choice)

## Setup
- Install Python dependencies:

```powershell
pip install selenium
```

- Download a ChromeDriver matching your installed Chrome version and place it on your `PATH` or next to `main.py`.

## Usage

- Run the script directly from PowerShell:

```powershell
python .\main.py
```

- By default the script opens a visible Chrome window. To run headless, instantiate the class with `headless=True` in `main()` (or modify `main.py`):

```python
app = ARSDApp(name, rollNo, password, headless=True)
app.get_attendance()
```

API (quick)
- `ARSDApp(name, rollNo, password, headless: bool = False)` : constructor sets up the webdriver and credentials.
- `get_attendance()` : logs in, navigates to the monthly attendance page, attempts to select paper type and search, prints outcome and returns `True` if report found, `False` otherwise. Always closes the browser.
- `get_faculty_details()` : Retrieves subject and faculty details using your credentials.

## Notes & Troubleshooting
- Ensure ChromeDriver version matches your installed Chrome. Mismatched versions can cause `SessionNotCreatedException`.
- If running on CI or a headless server, use the `headless=True` option and make sure the environment supports running Chrome headlessly.
- Adjust the explicit `WebDriverWait` timeouts in `main.py` if your network or site is slow.

## Next steps
- To implement an API workflow
- To convert the CLI into an app using REACT NATIVE
- Increase more features so that students needn't visit the boring website again and again

"""An employee must stay signed in while the access token expires under them.

The access token lives 15 minutes and the refresh token 7 days; a data-entry
session routinely outlives the first. Before the refresh interceptor in
`src/services/api.ts`, the 401 went straight to logout and the half-filled form
went with it. This drives a real browser against an API issuing 5-SECOND access
tokens, so the whole check takes seconds instead of a quarter of an hour.

    cd eg-api && make db-up && go build -o bin/api ./cmd/api
    ADDR=:8090 ACCESS_TOKEN_TTL=5s ./bin/api &
    cd ../web-admin && VITE_API_URL=http://127.0.0.1:8090/api/staff npx vite --port 5199 &
    python3 scripts/session-survives-token-expiry.py

Needs selenium and Chrome. Credentials come from eg-api/.env (ADMIN_EMAIL /
ADMIN_PASSWORD) — override with EMAIL / PASSWORD.
"""
import json, os, sys, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

ADMIN = os.environ.get("ADMIN_URL", "http://localhost:5199")
EMAIL = os.environ.get("EMAIL", "egroot@myeduguardian.com")
PASSWORD = os.environ.get("PASSWORD", "eGlocal!2026#dev")

opts = Options()
for a in ("--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1400,1000"):
    opts.add_argument(a)
driver = webdriver.Chrome(options=opts)
driver.set_page_load_timeout(60)


def auth_state():
    raw = driver.execute_script("return window.localStorage.getItem('auth-storage')")
    return json.loads(raw)["state"] if raw else {}


try:
    driver.get(f"{ADMIN}/login")
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type=email], input[name=email]")))
    driver.find_element(By.CSS_SELECTOR, "input[type=email], input[name=email]").send_keys(EMAIL)
    driver.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys(PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    WebDriverWait(driver, 20).until(lambda d: "/login" not in d.current_url)

    before = auth_state()
    token, refresh = before.get("token"), before.get("refreshToken")
    assert before.get("isAuthenticated"), "could not sign in"

    time.sleep(10)  # outlive the 5s access token

    # What a data-entry person does next. This is the request that used to 401.
    driver.get(f"{ADMIN}/universities")
    WebDriverWait(driver, 25).until(
        lambda d: "/login" in d.current_url or "universities" in d.current_url)
    time.sleep(4)

    after = auth_state()
    assert "/login" not in driver.current_url, "signed out mid-session"
    assert after.get("isAuthenticated"), "session dropped"
    assert after.get("token") not in (None, token), "access token was not renewed"
    # The server rotates the refresh token, which is why api.ts shares ONE
    # in-flight refresh: two at once and the loser signs everybody out.
    assert after.get("refreshToken") not in (None, refresh), "refresh token was not rotated"
    print("PASS — stayed signed in, token renewed and rotated")
except AssertionError as e:
    print(f"FAIL — {e}")
    sys.exit(1)
finally:
    driver.quit()

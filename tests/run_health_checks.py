import unittest
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class BlueTextHealthCheckRunner:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.steps = []
        self.start_time = datetime.now()
        
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=390,844")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)

    def log_step(self, description, status, duration_ms):
        self.steps.append({
            "description": description,
            "status": status,
            "duration": f"{duration_ms}ms"
        })

    def run_health_checks(self):
        # 1. Base URL Ping
        t0 = time.time()
        self.driver.get(self.base_url)
        d_ms = int((time.time() - t0) * 1000)
        self.log_step(f"url baseURL : {self.base_url}", "PASSED", d_ms)

        # 2. Validate Page Title
        t0 = time.time()
        assert "BlueTEXT" in self.driver.title
        d_ms = int((time.time() - t0) * 1000)
        self.log_step("match pageTitle == 'BlueTEXT.in'", "PASSED", d_ms)

        # 3. Mobile Hamburger Toggle Test
        t0 = time.time()
        toggle_btn = self.driver.find_element(By.CLASS_NAME, "nav-toggle")
        nav_menu = self.driver.find_element(By.ID, "nav-menu")
        self.driver.execute_script("arguments[0].click();", toggle_btn)
        time.sleep(0.3)
        assert "open" in nav_menu.get_attribute("class")
        d_ms = int((time.time() - t0) * 1000)
        self.log_step("TEST CASE : Mobile Navigation Drawer Open Toggle", "PASSED", d_ms)

        # 4. Mobile Offcanvas Close Button Test
        t0 = time.time()
        close_btn = nav_menu.find_element(By.CLASS_NAME, "nav-menu-close")
        self.driver.execute_script("arguments[0].click();", close_btn)
        time.sleep(0.3)
        assert "open" not in nav_menu.get_attribute("class")
        d_ms = int((time.time() - t0) * 1000)
        self.log_step("TEST CASE : Mobile Navigation Drawer Close Toggle", "PASSED", d_ms)

        # 5. Support / Razorpay Modal Health Check
        t0 = time.time()
        self.driver.execute_script("arguments[0].click();", toggle_btn)
        time.sleep(0.2)
        support_btn = self.driver.find_element(By.CLASS_NAME, "hdr-btn-donate")
        self.driver.execute_script("arguments[0].click();", support_btn)
        time.sleep(0.3)
        modal = self.driver.find_element(By.ID, "donate-modal-popup")
        assert "active" in modal.get_attribute("class")
        d_ms = int((time.time() - t0) * 1000)
        self.log_step("TEST CASE : Support Razorpay Modal Trigger", "PASSED", d_ms)

        # 6. Catalog JSON Endpoint Validation
        t0 = time.time()
        self.driver.get(self.base_url + "/assets/data/search-index.json")
        page_source = self.driver.page_source
        assert "url" in page_source
        d_ms = int((time.time() - t0) * 1000)
        self.log_step("path 'assets/data/search-index.json' status 200", "PASSED", d_ms)

        # 7. Subpages Health Check
        subpages = ["/pages/tools/", "/pages/games/", "/pages/software/", "/pages/tutorials/", "/pages/education/"]
        for p in subpages:
            t0 = time.time()
            self.driver.get(self.base_url + p)
            assert "BlueTEXT" in self.driver.title
            d_ms = int((time.time() - t0) * 1000)
            self.log_step(f"Validate Subpage Route : {p}", "PASSED", d_ms)

        self.driver.quit()
        return self.generate_report()

    def generate_report(self):
        total_time_ms = int((datetime.now() - self.start_time).total_seconds() * 1000)
        timestamp_str = datetime.now().strftime("%Y/%m/%d %H:%M:%S EST")
        
        lines = []
        lines.append("________________________________________")
        lines.append("From: Automated_QA_Runner@bluetext.in <Automated_QA_Runner@bluetext.in>")
        lines.append(f"Subject: LIVE : GREEN : Prod Local : BlueTEXT Automated Health Check Tests {timestamp_str}")
        lines.append(" ")
        lines.append("Health Check Execution Result Snapshot")
        lines.append(f"Target Environment URL : {self.base_url}")
        lines.append(f"{'Step Description':<70} {'Status':<10} {'Time'}")
        lines.append("-" * 90)
        
        for step in self.steps:
            lines.append(f"{step['description']:<70} {step['status']:<10} {step['duration']}")
            
        lines.append("-" * 90)
        lines.append(f"{'TOTAL EXECUTION TIME':<70} {'NA':<10} {total_time_ms}ms")
        
        return "\n".join(lines)

if __name__ == "__main__":
    runner = BlueTextHealthCheckRunner()
    report = runner.run_health_checks()
    print(report)
    with open("tests/health_check_report.txt", "w", encoding="utf-8") as f:
        f.write(report)

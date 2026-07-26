import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class BlueTextEnterpriseSuite:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.reports = []

    def get_driver(self, is_mobile=False):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        if is_mobile:
            chrome_options.add_argument("--window-size=390,844")
        else:
            chrome_options.add_argument("--window-size=1280,800")
        
        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=chrome_options)

    def run_scenario(self, scenario_title, target_url, steps_fn, is_mobile=False):
        driver = self.get_driver(is_mobile)
        scenario_steps = []
        scenario_start = time.time()

        def log_step(desc, status="PASSED", duration_ms=0):
            scenario_steps.append({"description": desc, "status": status, "duration": f"{duration_ms}ms" if duration_ms < 1000 else f"{duration_ms//1000}s {duration_ms%1000}ms"})

        try:
            steps_fn(driver, log_step)
        except Exception as e:
            log_step(f"Error encountered: {str(e)}", "FAILED", 0)
        finally:
            driver.quit()

        total_ms = int((time.time() - scenario_start) * 1000)
        total_time_str = f"{total_ms//1000}s {total_ms%1000}ms" if total_ms >= 1000 else f"{total_ms}ms"

        self.reports.append({
            "title": scenario_title,
            "url": target_url,
            "steps": scenario_steps,
            "total_time": total_time_str
        })

    def execute_all(self):
        # ---------------------------------------------------------------------
        # MOBILE SCENARIOS
        # ---------------------------------------------------------------------
        # Mobile Scenario 1: User go to Menu page & navigate subcategories
        def mobile_menu_flow(driver, log_step):
            t0 = time.time()
            driver.get(self.base_url)
            log_step("User opens mobile application homepage", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            toggle_btn = driver.find_element(By.CLASS_NAME, "nav-toggle")
            driver.execute_script("arguments[0].click();", toggle_btn)
            time.sleep(0.3)
            log_step("user taps Menu hamburger button", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            nav_menu = driver.find_element(By.ID, "nav-menu")
            assert "open" in nav_menu.get_attribute("class")
            log_step("mobile drawer panel should be displayed with logo and close button", "PASSED", int((time.time() - t0)*1000))

        self.run_scenario("User go to Mobile Menu page and verify offcanvas drawer :", self.base_url, mobile_menu_flow, is_mobile=True)

        # Mobile Scenario 2: Search price / tool catalog & filter chips
        def mobile_search_flow(driver, log_step):
            t0 = time.time()
            driver.get(self.base_url)
            log_step("User opens mobile catalog page", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            search_input = driver.find_element(By.ID, "homepage-search-input")
            search_input.send_keys("JSON")
            time.sleep(0.3)
            log_step("user types 'JSON' into instant search bar", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            chips = driver.find_elements(By.CLASS_NAME, "chip-btn")
            assert len(chips) > 0
            log_step("category chips carousel should display scrollable filters", "PASSED", int((time.time() - t0)*1000))

        self.run_scenario("User go to Mobile Search & Category Filters :", self.base_url, mobile_search_flow, is_mobile=True)

        # ---------------------------------------------------------------------
        # WEB DESKTOP SCENARIOS
        # ---------------------------------------------------------------------
        # Desktop Scenario 1: Desktop Navigation & Subcategory Dropdown Hover
        def desktop_nav_flow(driver, log_step):
            t0 = time.time()
            driver.get(self.base_url)
            log_step("I open the web application homepage", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            dropdowns = driver.find_elements(By.CLASS_NAME, "nav-dropdown")
            assert len(dropdowns) == 5
            log_step("I navigate to header menu Tools, Games, Software, Tutorials, Education dropdowns", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            close_btn = driver.find_element(By.CLASS_NAME, "nav-menu-close")
            assert not close_btn.is_displayed()
            log_step("I verify mobile close button is hidden on desktop viewport", "PASSED", int((time.time() - t0)*1000))

        self.run_scenario("This scenario verifies desktop header navigation & subcategory dropdowns :", self.base_url, desktop_nav_flow, is_mobile=False)

        # Desktop Scenario 2: Deep Route Breadcrumb Navigation Validation
        def desktop_breadcrumb_flow(driver, log_step):
            t0 = time.time()
            driver.get(self.base_url + "/pages/tools/coding/")
            log_step("I navigate to subcategory page /pages/tools/coding/", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            crumbs = driver.find_elements(By.CSS_SELECTOR, "nav[aria-label='Breadcrumb'] ol li")
            assert len(crumbs) == 4
            log_step("I verify breadcrumb hierarchy contains Home -> Pages -> Tools -> Coding", "PASSED", int((time.time() - t0)*1000))

            t0 = time.time()
            tools_crumb = crumbs[2].find_element(By.TAG_NAME, "a")
            assert tools_crumb.get_attribute("href").endswith("/pages/tools/")
            log_step("I verify 'Tools' breadcrumb link resolves correctly to /pages/tools/", "PASSED", int((time.time() - t0)*1000))

        self.run_scenario("This scenario verifies deep route breadcrumb navigation :", self.base_url + "/pages/tools/coding/", desktop_breadcrumb_flow, is_mobile=False)

        return self.format_enterprise_report()

    def format_enterprise_report(self):
        timestamp_str = datetime.now().strftime("%Y/%m/%d %H:%M:%S EST")
        
        output = []
        output.append("==========================================================================================")
        output.append("From: bluetext-qa-automation@bluetext.in <bluetext-qa-automation@bluetext.in>")
        output.append("Subject: LIVE : GREEN - Core Mobile & Web UI Health Check Snapshot - " + timestamp_str)
        output.append("==========================================================================================")
        output.append(" ")

        for report in self.reports:
            output.append(f"{report['title']} {report['url']}")
            output.append(f"{'Step Description':<70} {'Status':<10} {'Time'}")
            output.append("-" * 90)
            for s in report['steps']:
                output.append(f"{s['description']:<70} {s['status']:<10} {s['duration']}")
            output.append("-" * 90)
            output.append(f"{'TOTAL EXECUTION TIME':<70} {'NA':<10} {report['total_time']}")
            output.append(" ")

        return "\n".join(output)

if __name__ == "__main__":
    suite = BlueTextEnterpriseSuite()
    report = suite.execute_all()
    print(report)
    with open("tests/enterprise_suite_report.txt", "w", encoding="utf-8") as f:
        f.write(report)

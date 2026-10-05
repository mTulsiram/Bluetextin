import unittest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class BlueTextWebTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=390,844") # Mobile viewport for testing
        
        service = Service(ChromeDriverManager().install())
        cls.driver = webdriver.Chrome(service=service, options=chrome_options)
        cls.base_url = "http://localhost:8080"

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_01_homepage_loads(self):
        self.driver.get(self.base_url)
        self.assertIn("BlueTEXT.in", self.driver.title)

    def test_02_mobile_hamburger_toggle(self):
        self.driver.get(self.base_url)
        time.sleep(1)
        
        toggle_btn = self.driver.find_element(By.CLASS_NAME, "nav-toggle")
        nav_menu = self.driver.find_element(By.ID, "nav-menu")
        
        # Open drawer
        self.driver.execute_script("arguments[0].click();", toggle_btn)
        time.sleep(0.5)
        self.assertTrue("open" in nav_menu.get_attribute("class"), "Nav menu should have class 'open' when clicked")
        
        # Close drawer via close button inside menu
        close_btn = nav_menu.find_element(By.CLASS_NAME, "nav-menu-close")
        self.driver.execute_script("arguments[0].click();", close_btn)
        time.sleep(0.5)
        self.assertFalse("open" in nav_menu.get_attribute("class"), "Nav menu should not have class 'open' after closing")

    def test_03_support_modal_popup(self):
        self.driver.get(self.base_url)
        time.sleep(1)
        
        # Open drawer first on mobile viewport
        toggle_btn = self.driver.find_element(By.CLASS_NAME, "nav-toggle")
        self.driver.execute_script("arguments[0].click();", toggle_btn)
        time.sleep(0.5)

        # Click donate trigger button inside drawer
        support_btn = self.driver.find_element(By.CLASS_NAME, "hdr-btn-donate")
        self.driver.execute_script("arguments[0].click();", support_btn)
        time.sleep(0.5)
        
        modal = self.driver.find_element(By.ID, "donate-modal-popup")
        self.assertTrue("active" in modal.get_attribute("class"), "Donate modal popup should be active")
        
        # Verify Razorpay container exists inside modal
        rzp_container = modal.find_element(By.ID, "razorpay-form-container")
        self.assertIsNotNone(rzp_container, "Razorpay form container should exist in donate modal")

    def test_04_subpages_status(self):
        subpages = [
            "/pages/tools/",
            "/pages/games/",
            "/pages/software/",
            "/pages/tutorials/",
            "/pages/education/",
            "/pages/blog/",
            "/support.html",
            "/assets/nav/about.html"
        ]
        for rel in subpages:
            self.driver.get(self.base_url + rel)
            self.assertIn("BlueTEXT", self.driver.title, f"Page {rel} title should contain BlueTEXT")

    def test_05_converter_engine_sanitize_value(self):
        # Navigate to a page that loads converter-engine.js or open homepage and load script
        self.driver.get(self.base_url + "/pages/tools/converters/physical-dimension-studio.html")
        time.sleep(0.5)

        test_cases = [
            # (input_val, expected_val)
            (12.3456789, 12.345679),      # standard float rounded to 6 decimal places
            (10, 10),                     # integer value
            ("42.12345678", 42.123457),   # float string parsed and rounded
            ("1.500000", 1.5),            # trailing zeros stripped by Number()
            (0, 0),                       # zero integer
            ("0.0000000", 0),             # string zero
            (-12.3456789, -12.345679),    # negative float rounded
            (-5, -5),                     # negative integer
            (0.0000001, 0),               # small float below 6 decimal precision rounds to 0
            (0.000006, 0.000006),         # 6th decimal float precision preserved
            ("0.0000006", 0.000001),      # string representation with 7th decimal > 5 rounds up
        ]

        for input_val, expected_val in test_cases:
            res = self.driver.execute_script("return window.ConverterEngine.sanitizeValue(arguments[0]);", input_val)
            self.assertEqual(res, expected_val, f"ConverterEngine.sanitizeValue({input_val!r}) should return {expected_val!r}, got {res!r}")

        # Test NaN handling for non-numeric input
        nan_inputs = ["abc", None, "invalid"]
        for input_val in nan_inputs:
            is_nan = self.driver.execute_script("return Number.isNaN(window.ConverterEngine.sanitizeValue(arguments[0]));", input_val)
            self.assertTrue(is_nan, f"ConverterEngine.sanitizeValue({input_val!r}) should return NaN")

if __name__ == "__main__":
    unittest.main()

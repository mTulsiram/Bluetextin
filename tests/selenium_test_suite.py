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

if __name__ == "__main__":
    unittest.main()

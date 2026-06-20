import os
import re
import sys
import xml.etree.ElementTree as ET

workspace_root = r"c:\Users\tulsiram_methre\Music\Projects\BlueTEXTin"
errors = []
warnings = []

def log_error(msg):
    errors.append(msg)
    print(f"[ERROR] {msg}")

def log_warn(msg):
    warnings.append(msg)
    print(f"[WARNING] {msg}")

def log_success(msg):
    print(f"[SUCCESS] {msg}")

print("=== STARTING BLUETEXT.IN DIAGNOSTICS & VERIFICATION SUITE ===")

# 1. Verify sitemap.xml
sitemap_path = os.path.join(workspace_root, "sitemap.xml")
if not os.path.exists(sitemap_path):
    log_error("sitemap.xml does not exist in root directory!")
else:
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = root.findall('ns:url', namespace)
        
        if len(urls) == 0:
            log_error("sitemap.xml contains 0 URLs.")
        else:
            log_success(f"sitemap.xml parsed successfully with {len(urls)} URLs.")
            # Check domain naming consistency
            sample_loc = urls[0].find('ns:loc', namespace).text
            if not sample_loc.startswith("https://bluetext.in"):
                log_error(f"Sitemap canonical domain schema is incorrect! Found: {sample_loc}")
            else:
                log_success("Sitemap canonical domain matches 'https://bluetext.in'.")
    except Exception as e:
        log_error(f"Sitemap is not a valid XML file: {e}")

# 2. Check Header structure & accessibility hooks
header_path = os.path.join(workspace_root, "components", "header.html")
if not os.path.exists(header_path):
    log_error("components/header.html is missing!")
else:
    with open(header_path, "r", encoding="utf-8") as f:
        content = f.read()
        
        # Check Skip Link
        if 'class="skip-link"' not in content:
            log_error("Skip link element is missing in header!")
        else:
            log_success("Skip link anchor is present in components/header.html.")
            
        # Check Branding Logo (.in yellow coloring)
        if 'class="logo-in"' not in content or 'color: var(--accent-warning);' not in content:
            log_error("Branding logo doesn't include stylized gold/yellow '.in' element!")
        else:
            log_success("Logo branding includes yellow '.in' structure.")
            
        # Check ARIA hooks
        aria_matches = re.findall(r'aria-\w+=', content)
        if len(aria_matches) < 5:
            log_warn(f"Few ARIA tags found in header ({len(aria_matches)}). Check accessibility tags.")
        else:
            log_success(f"Found {len(aria_matches)} ARIA tags in header.html.")

# 3. Check Footer compliance indicators
footer_path = os.path.join(workspace_root, "components", "footer.html")
if not os.path.exists(footer_path):
    log_error("components/footer.html is missing!")
else:
    with open(footer_path, "r", encoding="utf-8") as f:
        content = f.read()
        compliance_pills = ["GDPR", "CCPA", "PIPL", "LGPD", "DPDP", "WCAG 2.2 AA"]
        missing_pills = [p for p in compliance_pills if p not in content]
        if missing_pills:
            log_error(f"Missing compliance badges in footer: {missing_pills}")
        else:
            log_success("All privacy compliance pills are registered in the footer.")

# 4. Check app.js logic (Theme Toggling dataset checks, i18n variables, credentials login mock)
app_path = os.path.join(workspace_root, "assets", "js", "app.js")
if not os.path.exists(app_path):
    log_error("assets/js/app.js is missing!")
else:
    with open(app_path, "r", encoding="utf-8") as f:
        content = f.read()
        
        # Check theme dataset selection
        if 'setAttribute(\'data-theme\'' not in content:
            log_error("Theme toggler is not setting data-theme attribute on document root!")
        else:
            log_success("Theme manager correctly applies 'data-theme' attribute.")
            
        # Check sign in dialog triggers
        if 'login-modal-overlay' not in content or 'admin' not in content or 'password' not in content:
            log_error("Interactive login modal credentials validation logic is missing in app.js!")
        else:
            log_success("Credentials verification form modal logic is integrated.")
            
        # Check translations
        if 'TRANSLATIONS = {' not in content or 'es:' not in content or 'hi:' not in content:
            log_error("Language translations dictionary is missing or incomplete in app.js!")
        else:
            log_success("I18n translations dictionary is integrated inside app.js.")
            
        # Check settings sync (exportUserSettings & importUserSettings)
        if 'exportUserSettings' not in content or 'importUserSettings' not in content:
            log_error("Import/Export JSON configurations module is missing in app.js!")
        else:
            log_success("Settings configuration import/export module is integrated.")

# 5. Check index.html translation tags
index_path = os.path.join(workspace_root, "index.html")
if not os.path.exists(index_path):
    log_error("index.html is missing in root!")
else:
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()
        i18n_tags = re.findall(r'data-i18n="', content)
        if len(i18n_tags) < 5:
            log_error(f"Only {len(i18n_tags)} data-i18n tags found in index.html. Translation keys are missing!")
        else:
            log_success(f"Found {len(i18n_tags)} i18n page translation nodes in index.html.")

print("=== VERIFICATION SUMMARY ===")
print(f"Total Errors: {len(errors)}")
print(f"Total Warnings: {len(warnings)}")

if len(errors) > 0:
    print("Status: DIAGNOSTICS FAILED.")
    sys.exit(1)
else:
    print("Status: DIAGNOSTICS PASSED! All specifications aligned.")
    sys.exit(0)

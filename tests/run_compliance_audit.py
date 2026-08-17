import os
import sys
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def run_audit():
    print("==================================================")
    print(" BlueTEXT.in — Global Compliance & A11y Scanner")
    print("==================================================")
    
    total_html = 0
    cdn_violations = []
    missing_landmarks = []
    missing_titles = []
    
    for dirpath, _, filenames in os.walk(ROOT):
        # Skip non-public / system dirs and component fragments
        if any(ignored in dirpath for ignored in [".git", "node_modules", "assets" + os.sep + "components"]):
            continue
            
        for f in filenames:
            if f.endswith(".html"):
                total_html += 1
                full_path = os.path.join(dirpath, f)
                rel_path = os.path.relpath(full_path, ROOT)
                
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fp:
                    content = fp.read()
                    
                # 1. Check for unauthorized external CDN runtime scripts
                if re.search(r'<script[^>]+src=["\']https?://(?!localhost)', content, re.IGNORECASE):
                    cdn_violations.append(rel_path)
                    
                # 2. Check for semantic landmarks
                if "<main" not in content and "id=\"main-content\"" not in content:
                    missing_landmarks.append(rel_path)
                    
                # 3. Check for page title
                if "<title>" not in content:
                    missing_titles.append(rel_path)
                    
    print(f"Total HTML files scanned: {total_html}")
    print(f"CDN runtime violations   : {len(cdn_violations)}")
    print(f"Missing landmarks        : {len(missing_landmarks)}")
    print(f"Missing titles           : {len(missing_titles)}")
    
    if missing_landmarks:
        print("\n[!] Missing <main> or id=\"main-content\":")
        for m in missing_landmarks:
            print(f"  - {m}")

    if missing_titles:
        print("\n[!] Missing <title>:")
        for t in missing_titles:
            print(f"  - {t}")
            
    success = (len(cdn_violations) == 0 and len(missing_landmarks) == 0 and len(missing_titles) == 0)
    print("--------------------------------------------------")
    print(f"Audit Result: {'PASSED [OK] (100% GREEN)' if success else 'FAILED [X]'}")
    print("==================================================")
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(run_audit())

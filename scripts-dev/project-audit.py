import os
import re
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_audit():
    errors = []
    checked_count = 0
    html_count = 0
    json_count = 0
    redirect_count = 0

    # Pattern matchers
    doctype_re = re.compile(r'<!doctype\s+html', re.IGNORECASE)
    html_lang_re = re.compile(r'<html\s+[^>]*lang=["\']([^"\']+)["\']', re.IGNORECASE)
    title_re = re.compile(r'<title>([\s\S]*?)</title>', re.IGNORECASE)
    meta_desc_re = re.compile(r'<meta\s+[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', re.IGNORECASE)
    header_placeholder_re = re.compile(r'id=["\'](?:site-header|header-placeholder)["\']', re.IGNORECASE)
    footer_placeholder_re = re.compile(r'id=["\'](?:site-footer|footer-placeholder)["\']', re.IGNORECASE)
    meta_refresh_re = re.compile(r'<meta\s+http-equiv=["\']refresh["\']', re.IGNORECASE)

    # List of directories to ignore completely
    ignored_dirs = ['.git', 'tools', '.gemini', 'node_modules', 'scripts-dev', 'assets']
    # List of files to ignore completely
    ignored_files = ['FullCodeExport.txt', 'LICENSE', 'wrangler.jsonc', '_headers', '_redirects', 'robots.txt', 'ads.txt', 'sitemap.xml', 'manifest.webmanifest']

    for root, dirs, files in os.walk(ROOT_DIR):
        # Skip ignored paths
        if any(ignored in root for ignored in ignored_dirs):
            continue
            
        for file in files:
            if file in ignored_files:
                continue
                
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, ROOT_DIR)
            
            if file.endswith('.html'):
                checked_count += 1
                html_count += 1
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # 1. Check if it is a localized redirection page
                    is_redirect = meta_refresh_re.search(content) is not None
                    
                    if is_redirect:
                        redirect_count += 1
                        # Redirect validation: check lang
                        lang_match = html_lang_re.search(content)
                        if not lang_match:
                            errors.append(f"[{rel_path}]: Redirect page missing lang attribute")
                        else:
                            lang = lang_match.group(1)
                            parts = rel_path.split(os.sep)
                            if len(parts) > 1 and parts[0] in ['zh-CN', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja', 'sw', 'mr', 'te', 'tr', 'ta', 'vi', 'ko']:
                                expected_lang = parts[0]
                                if lang != expected_lang:
                                    errors.append(f"[{rel_path}]: Redirect lang '{lang}' does not match directory '{expected_lang}'")
                        
                        # Check location.replace script exists
                        if 'location.replace(' not in content:
                            errors.append(f"[{rel_path}]: Redirect page missing JS location.replace fallback")
                        continue
                    
                    # 2. Doctype, Lang, and Title checks (only for full HTML pages, not component templates)
                    if not rel_path.startswith('components'):
                        if not doctype_re.search(content):
                            errors.append(f"[{rel_path}]: Missing HTML5 <!DOCTYPE html> declaration")
                        
                        if not html_lang_re.search(content):
                            errors.append(f"[{rel_path}]: Missing lang attribute on <html> element")
                        
                        if not title_re.search(content):
                            errors.append(f"[{rel_path}]: Missing <title> tag")
                    
                    # 5. Meta Description Check (except for component templates)
                    if not rel_path.startswith('components') and not rel_path.startswith('tools-platform'):
                        if not meta_desc_re.search(content):
                            errors.append(f"[{rel_path}]: Missing meta description tag")
                    
                    # 6. Header / Footer placeholder check
                    if not rel_path.startswith('components') and not rel_path.startswith('tools-platform') and not rel_path.startswith('categories'):
                        if not header_placeholder_re.search(content):
                            errors.append(f"[{rel_path}]: Missing site header placeholder")
                        if not footer_placeholder_re.search(content):
                            errors.append(f"[{rel_path}]: Missing site footer placeholder")
                            
                except Exception as e:
                    errors.append(f"[{rel_path}]: Error reading HTML: {str(e)}")
                    
            elif file.endswith('.json'):
                checked_count += 1
                json_count += 1
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        json.load(f)
                except Exception as e:
                    errors.append(f"[{rel_path}]: Invalid JSON formatting: {str(e)}")

    print(f"Audit completed: Checked {checked_count} files ({html_count} HTML [inc. {redirect_count} redirects], {json_count} JSON).")
    print(f"Total Actual Errors found: {len(errors)}")
    
    # Write report
    report_path = os.path.join(ROOT_DIR, "tools-platform", "tool-inventory-audit.md")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Project Visual & Structural Audit Report\n\n")
        f.write(f"Generated on: 2026-06-15\n")
        f.write(f"- Checked Files: {checked_count}\n")
        f.write(f"- HTML pages (excluding redirects): {html_count - redirect_count}\n")
        f.write(f"- Localized Redirect pages: {redirect_count}\n")
        f.write(f"- JSON data files: {json_count}\n")
        f.write(f"- Total Actual Errors: {len(errors)}\n\n")
        f.write("## Audit Findings & Action Items\n\n")
        if not errors:
            f.write("✓ All files structurally sound and aligned with SEO and language conventions!\n")
        else:
            for error in errors:
                f.write(f"- [ ] {error}\n")
                
    print(f"Report written to {report_path}")

if __name__ == "__main__":
    run_audit()

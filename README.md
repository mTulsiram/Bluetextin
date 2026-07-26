# BlueTEXT.in

BlueTEXT.in is a high-performance, client-side web application platform containing 500+ free online tools, games, tutorials, software catalogs, and educational resources. 

---

## 🚀 Running Locally

Start the local static server using Python standard library:

```bash
# Start local static server (Python 3)
python server.py
```

Then open `http://localhost:8080` in your browser.

---

## 🛠️ Build Pipeline & Single Command

All site assets, search catalogs, category indices, translation dictionaries, and header/footer components are managed through a unified single build script:

```bash
# Execute complete build pipeline
node scripts/build.js
```

### Pipeline Automated Tasks:
- **Search Catalog Indexing**: Compiles `assets/data/search-index.json` across 536 pages.
- **Component Injection**: Injects `assets/components/header.html` and `assets/components/footer.html` into `<!-- HEADER_START -->` and `<!-- FOOTER_START -->` placeholders.
- **Offline Multi-Language Catalogs**: Generates translation dictionaries (`assets/data/i18n/*.json`) for 19 languages.
- **XML Sitemap Generation**: Updates `sitemap.xml` with 536 canonical routes.

---

## 🧪 Automated Testing & Health Checks

Run the automated Selenium E2E test suite:

```bash
# Run enterprise Selenium health checks
python tests/run_enterprise_suite.py
```

---

## 📁 Repository Structure

```text
├── index.html                  # Main homepage
├── support.html                # Support and donation landing page (Razorpay modal)
├── sitemap.xml                 # Canonical XML sitemap (536 routes)
├── server.py                   # Lightweight Python 3 static web server
├── scripts/
│   └── build.js                # Consolidated build pipeline
├── tests/
│   ├── run_enterprise_suite.py # Enterprise Selenium health check runner
│   └── selenium_test_suite.py  # E2E Selenium UI test scenarios
├── assets/
│   ├── components/             # Reusable UI templates (header.html, footer.html)
│   ├── css/                    # Unified stylesheet (main.css)
│   ├── data/                   # Search index & translation dictionaries
│   └── js/                     # Client-side JavaScript (app.js)
└── pages/                      # Content & category tree index pages
    ├── tools/                  # Web applications & converters
    ├── games/                  # Web arcade & puzzle games
    ├── software/               # Open-source & utility software catalogs
    ├── tutorials/              # Developer & designer guides
    └── education/              # Learning & study resources
```

---

## ⚡ Key Features

- **100% Client-Side**: All converters and tools execute locally in the user's browser.
- **Dark / Light Mode**: Dynamic theme switching with persistent user preference.
- **Offline Multi-Language Support**: Pre-compiled translation catalogs for 19 major languages.
- **WCAG 2.1 AA Compliant**: High contrast typography, accessible focus rings, and clean semantic markup.
- **Clean Responsive Navigation**: Offcanvas drawer on mobile and absolute hover dropdowns on desktop viewports.

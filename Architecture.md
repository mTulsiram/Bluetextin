# Technical Architecture Specification (Architecture.md)

This document describes the technical architecture and compliance framework for **BlueTEXT.in**. As a local-first, serverless utility suite, the platform offloads execution to the client's browser, providing extreme speed, privacy, and off-grid performance.

---

## 1. Client-Side Runtime & Infrastructure

### A. Folder Architecture Map (Subcategory Structure)
To support a high-quality visual navigation dashboard, the codebase organizes all tools, games, software, and tutorials into five core categories. Each entry is hosted within its own subdirectory containing a dedicated index file:

```
/ (Root)
├── index.html                      # Landing page & core search router
├── DESIGN.md                       # Brand design and accessibility standards
├── Architecture.md                 # Technical architecture spec
├── assets/
│   ├── css/                        # themes.css, base.css, components.css
│   ├── js/                         # app.js, router.js, service-worker.js
│   └── data/                       # tools.json metadata index file
├── components/
│   ├── header.html                 # Global navigation template
│   └── footer.html                 # Global footer containing compliance indicators
├── tools/                          # 2-Level Utility Directory Namespace
│   ├── images/                     # index.html, jpeg-compressor.html, png-to-webp-converter.html
│   ├── videos/                     # index.html, mp4-compressor.html, video-to-gif.html
│   ├── office/                     # index.html, word-processor.html, spreadsheet-editor.html
│   ├── coding/                     # index.html, json-formatter.html, html-minifier.html
│   ├── math/                       # index.html, percentage-calculator.html, scientific-calculator.html
│   ├── converters/                 # index.html, length-converter.html, weight-mass-converter.html
│   ├── network/                    # index.html, ip-address-lookup.html, dns-records-checker.html
│   ├── lifestyle/                  # index.html, bmi-calculator.html, bmr-calculator.html
│   ├── utilities/                  # index.html, password-generator.html, qr-code-generator.html
│   ├── data/                       # index.html, csv-to-json-converter.html, json-to-csv-converter.html
│   └── miscellaneous/              # index.html, collaborative-whiteboard.html, sketchpad-drawer.html
├── games/                          # Client-Side Interactive Web Games
│   ├── arcade/                     # index.html, snake-canvas.html, brick-breaker.html
│   ├── puzzles/                    # index.html, sudoku-board.html, tetris-blocks.html
│   ├── board/                      # index.html, chess-engine.html, checkers-draughts.html
│   ├── cards/                      # index.html, solitaire-klondike.html, blackjack-twenty-one.html
│   └── word/                       # index.html, wordle-clone.html, hangman-classic.html
├── software/                       # Client-Side Platform Software Maps
│   ├── windows/                    # utility/index.html, productivity/index.html, games/index.html, development/index.html, design/index.html, security/index.html, communication/index.html, multimedia/index.html
│   ├── linux/                      # utility/index.html, productivity/index.html, games/index.html, development/index.html, design/index.html, security/index.html, communication/index.html, multimedia/index.html
│   ├── android/                    # utility/index.html, productivity/index.html, games/index.html, development/index.html, design/index.html, security/index.html, communication/index.html, multimedia/index.html
│   └── apple/                      # utility/index.html, productivity/index.html, games/index.html, development/index.html, design/index.html, security/index.html, communication/index.html, multimedia/index.html
├── tutorials/                      # Developer Tutorials & Technical Guides
│   ├── web-dev/                    # index.html, html5-basics-for-beginners.html, css3-flexbox-and-grid-guide.html
│   ├── programming/                # index.html, python-syntax-and-data-structures.html
│   ├── backend/                    # index.html, sql-queries-join-and-select.html
│   ├── design/                     # index.html, ui-ux-principles-for-clean-layouts.html
│   └── security/                   # index.html, web-application-security-owasp-top-10.html
└── education/                      # Educational Text Modules & Resources
    ├── math/                       # index.html, pre-algebra-essentials.html, understanding-fractions-and-decimals.html
    ├── science/                    # index.html, understanding-the-periodic-table.html
    ├── humanities/                 # index.html, world-history-major-turning-points.html
    ├── languages/                  # index.html, english-grammar-tenses-and-structures.html
    └── finance/                    # index.html, personal-budgeting-and-saving-strategies.html
```

### B. Relative Asset Resolving Framework
Because the pages reside in deeply nested subdirectories (up to four levels deep, e.g., `/software/windows/utility/index.html`), hardcoded absolute asset imports can fail if the site is opened locally via file protocol (`file:///`). 
- **Relative Resolving**: All page links, stylesheets, script inclusions, and dynamic component loader URLs (`header.html`, `footer.html`) must use relative path formatting (e.g., `../../../assets/css/main.css`).
- **Dynamic Loader Adjustment**: The dynamic layout script (`app.js`) computes the distance back to root using `window.location.pathname` depth, and automatically prefixes component fetch calls.

---

## 2. Universal Privacy Engine (Regional Consent Mapping)
To satisfy multi-jurisdiction privacy mandates globally, the platform uses a **Zero-Database Consent Engine** running client-side.

### A. Geographic Compliance Triggers
Region categorization is determined via a client-side lookup (IP location API or regional selection dropdown in the header/footer).

- **GDPR & ePrivacy (Europe)**:
  - **Opt-In Requirement**: No advertising or analytics scripts can load until consent is explicitly granted (Strict Opt-In).
  - **Right to be Forgotten**: A "Privacy Preferences -> Reset Data" button in the footer wipes all `localStorage`, `sessionStorage`, `IndexedDB` stores, and local caches instantly.
- **CCPA / CPRA & COPPA (United States)**:
  - **Opt-Out Control**: A permanent footer link reading `"Do Not Sell My Personal Information"` sets a localized tracking-exclusion flag.
  - **COPPA Age-Gate**: Financial or analytical tracking is disabled for users self-declaring as under 13.
- **DPDP Act 2023 (India)**:
  - **Consent Manager Interface**: Allow users to withdraw consent item-by-item (separating functional tool storage from advertisement tracking).
  - **Parental Consent Gate**: Implement a strict age-verification gate for minors (under 18) before activating ad rendering.
- **PIPL (China)**:
  - Show a compliance notice confirming that all data processes occur locally on the user's machine (complying with data localization requirements).
- **LGPD (Brazil)**:
  - Provide a dynamic contact point for the local Data Protection Officer (DPO) in the Privacy Policy modal.

### B. Ads & Analytics Script Consent Flow
Third-party monetization scripts must be gated behind the client's consent registry state:
1. **Google AdSense (IAB TCF v2.2)**: Ad tags are injected into designated container widgets only after the Consent Management Platform (CMP) resolves the consent cookie (`tcString`).
2. **Google Analytics & Facebook Pixel**: Integrated via dynamic script loaders that inject the tracker triggers conditionally matching Google Consent Mode v2 variables.

---

## 3. Financial, E-Commerce & Payment Architecture (PCI-DSS)
To facilitate donations, subscriptions, and shop products without security liabilities, the site offloads operations using client-side integrations:

- **Patreon / Buy Me a Coffee**: Dynamic card links loading external checkout portals.
- **Stripe & Razorpay Embedded Checkouts**: Payments are processed using Stripe Elements or Razorpay Checkout scripts. Both options securely capture credit card digits inside iframe overlays, returning transaction authorization tokens directly to the front-end, maintaining **PCI-DSS SAQ A** compliance.
- **Gumroad Shop Integration**: Gumroad products are linked via a local product grid. When clicked, they load Gumroad's official lightweight overlay script (`https://gumroad.com/js/embed.js`), initiating checkout directly within a client-side frame.

---

## 4. Cloudflare Hosting & Subdomain Routing
The project is deployed using **Cloudflare Pages**, configured with custom routing rules:

- **Custom Domain**: Managed by Cloudflare DNS, pointing to Godaddy registration.
- **Subdomain Routing (`blog.bluetext.in`)**:
  - The blogging system is delegated to a dedicated sub-page configuration (`blog.bluetext.in`) utilizing Cloudflare's routing configurations.
  - Static routing rules configured in `_headers` enforce HSTS, secure cache headers, and strict Content Security Policies (CSP):
    ```http
    Content-Security-Policy: default-src 'self'; script-src 'self' https://js.stripe.com https://checkout.razorpay.com https://gumroad.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    ```

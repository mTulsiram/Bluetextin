# Bluetext.in

Fast, privacy-friendly online tools platform built as static HTML, CSS, and JavaScript.

## Current MVP Scope

- Core homepage and category discovery flows
- Shared data-driven catalog in assets/data/tools.json
- Implemented tools across calculators, converters, PDF, images, text, developer, files, and SEO
- Coming Soon handling for not-yet-built tools
- Top-level and subcategory listing pages generated from shared runtime filters
- Baseline SEO + PWA + Cloudflare deploy configuration

## Key Files

- index.html: homepage shell
- assets/css/main.css: design system and page styles
- assets/js/main.js: homepage data loading and search behavior
- assets/js/category-page.js: category listing runtime
- assets/js/partials.js: shared header/footer loader
- assets/data/tools.json: canonical tool catalog
- tools-platform/all-tools.html: global tool discovery page
- tools-platform/qa-check.html: in-browser consistency checks
- scripts-dev/generate-sitemap.ps1: sitemap generator

## Workflow

### 1) Update tool catalog

Edit assets/data/tools.json and maintain:

- id: unique
- path: relative HTML route
- status: ready or coming-soon
- featured: true only for ready tools that should appear on homepage

### 2) Regenerate sitemap

Run from project root:
# Bluetext.in - The Ultimate Online Utility Suite

![Bluetext.in](https://www.bluetext.in/assets/img/og-image.png)

Welcome to the official repository for **Bluetext.in**, a comprehensive suite of over 900+ free online tools designed for developers, creators, and professionals. This project is built as a fast, secure, and privacy-respecting static Progressive Web App (PWA), hosted on Cloudflare Pages.

**Mission:** Simple. Fast. Privacy-first online tools.

---

## 🚀 Project Overview

Bluetext.in provides a massive library of tools across 16+ categories, including:

-   **Developer Tools:** JSON formatters, Base64 encoders, diff checkers, and more
-   **Image Utilities:** Converters, resizers, compressors, and bulk image processors
-   **PDF Tools:** Merging, splitting, compressing, and converting PDF files
-   **AI Utilities:** Content generators, summarizers, and other AI-powered helpers
-   **Calculators:** BMI, loan, financial, and scientific calculators
-   **Converters:** Unit, currency, and data format conversion tools
-   **SEO & YouTube:** Tools for creators and marketers to optimize content
-   **Text Tools:** Case converters, word counters, and text generators
-   **And hundreds more...**

The entire platform is designed to be a single, trusted destination for common online tasks, with a strong focus on user experience, performance, and privacy.

---

## 👨‍💻 About The Creator: Tulsiram Methre

**AWS Solution Architect | Cloud Architect | Creator of [BlueTEXT.in](https://www.bluetext.in)**

I am obsessed with helping developers build high-quality apps as fast as possible ⚡. I simplify complex code so that the open-source world can build better products together.

### 🚀 More About Me

- 🏢 **Working at:** Tata Consultancy Services (Hyderabad, India)
- 📺 **YouTube:** [CodeOn](https://www.youtube.com/@CodeOn) (700+ Subscribers | 590k+ Views)
- 🎓 **Expertise:** Java, Flutter, AWS, Azure, Web Technologies, ITSM Support
- ⚽ **Interests:** Football, Table-Tennis, Badminton
- 📍 **Location:** Hyderabad, India

### 🌐 Connect With Me

| Platform | Link |
|----------|------|
| 💼 LinkedIn | [linkedin.com/in/tulsiram-methre](https://linkedin.com/in/tulsiram-methre) |
| 🐦 Twitter | [twitter.com/Tulsiram_Methre](https://twitter.com/Tulsiram_Methre) |
| 💻 GitHub | [github.com/CodeOnYT](https://github.com/CodeOnYT) |
| 📸 Instagram | [instagram.com/CodeOnOriginal](https://instagram.com/CodeOnOriginal) |
| 💬 Discord | [discord.gg/6gNUAaHaPw](https://discord.gg/6gNUAaHaPw) |
| 👍 Facebook | [facebook.com/CodeOnYT](https://facebook.com/CodeOnYT) |
| Reddit | [reddit.com/user/BlueTEXTin](https://reddit.com/user/BlueTEXTin) |
| Pinterest | [pinterest.com/CodeOnYT](https://pinterest.com/CodeOnYT) |
| 🎥 Twitch | [twitch.tv/codeonyt](https://twitch.tv/codeonyt) |

### 💎 Support My Work

- **Buy Me A Coffee:** [buymeacoffee.com/BlueTEXT.in](https://www.buymeacoffee.com/BlueTEXT.in) **(Preferred)**
- **Patreon:** [patreon.com/BlueTEXT](https://www.patreon.com/BlueTEXT)
- **Ko-fi:** [ko-fi.com/bluetextin](https://ko-fi.com/bluetextin)
- **Newsletter:** [bluetextin.stck.me](https://bluetextin.stck.me)
- **UPI:** `Bluetext.in@UPI`

### 📞 Other Links

- **Email:** codeon@bluetext.in
- **Slack:** [bluetextin.slack.com](https://bluetextin.slack.com)
- **ORCID:** [orcid.org/0009-0007-8869-1617](https://orcid.org/0009-0007-8869-1617)

---

## 🛠️ Tech Stack & Architecture

This project is intentionally built with a simple, robust, and highly scalable static architecture.

-   **Frontend:** Plain HTML, CSS, and vanilla JavaScript. No complex frameworks are used, ensuring maximum performance and minimal load times
-   **Data Management:** The site's structure, tool lists, and categories are dynamically generated from `navigation.json` and `tools.json`, making the project data-driven and easy to update
-   **Hosting & Deployment:** Deployed on **Cloudflare Pages**, providing global CDN, free SSL, unlimited bandwidth, and seamless continuous deployment via GitHub
-   **Monetization:** Integrated with **Google AdSense** using Auto Ads for revenue generation
-   **Analytics:** User traffic and behavior monitored with **Google Analytics (GA4)**
-   **CSS Architecture:** 6-layer modular system (critical → base → themes → layout → components → pages)
-   **Runtime Pattern:** Client-side JavaScript injects metadata from tools.json into pages dynamically
-   **SEO:** Dynamic meta tags, sitemap.xml generation, structured data, canonical links
-   **PWA:** Service worker for offline support and faster repeat visits

---

## ⚙️ Local Development Setup

To run this project on your local machine, you need a simple local server to handle file serving.

### Prerequisites

-   **Node.js** (v14 or higher recommended)
-   **Git**

### Steps

1.  **Clone the Repository:**

	```bash
	git clone https://github.com/CodeOnYT/Bluetextin.git
	cd Bluetextin
	```

2.  **Install a Local Server:**

	If you have Node.js installed, the easiest way is to use `live-server`:

	```bash
	npm install -g live-server
	```

3.  **Run the Server:**

	From the root of the project directory:

	```bash
	live-server
	```

	This will open the site in your default browser (usually at `http://127.0.0.1:8080`) and will automatically reload the page when you save a file.

### Alternative: Using Python

If you have Python 3 installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

---

## 📁 Project Structure

The repository is organized as follows:

```
Bluetextin/
├── assets/
│   ├── css/                    # Modular stylesheets
│   │   ├── main.css             # Entry point with @imports
│   │   ├── critical.css          # Above-the-fold styles
│   │   ├── base.css              # Reset and typography
│   │   ├── themes.css            # Design system variables
│   │   ├── layout.css            # Structural layouts
│   │   ├── components.css        # Reusable UI components
│   │   └── pages.css             # Page-specific overrides
│   ├── data/
│   │   ├── navigation.json       # Category structure and metadata
│   │   └── tools.json            # Canonical tool catalog (900+ tools)
│   ├── js/
│   │   ├── main.js               # Homepage data loading and search
│   │   ├── partials.js           # Shared header/footer loader
│   │   ├── category-page.js      # Category page filtering runtime
│   │   ├── tool-runtime.js       # Dynamic tool metadata injection
│   │   └── i18n.js               # Internationalization support
│   ├── img/                      # Images and icons
│   └── lang/                     # Localization files
│       ├── en.json               # English strings
│       ├── fr.json               # French strings
│       └── hi.json               # Hindi strings
│
├── categories/                  # Category landing pages
│   ├── calculators.html
│   ├── converters.html
│   ├── pdf.html
│   ├── images.html
│   ├── text.html
│   ├── developer.html
│   ├── seo.html
│   ├── files.html
│   ├── ai.html
│   └── media.html
│
├── components/                  # Reusable HTML partials
│   ├── header.html
│   ├── footer.html
│   └── ads-main.html
│
├── games/                       # Playable games (10 games)
│   ├── 2048.html
│   ├── breakout.html
│   ├── snake-game.html
│   └── ... (7 more games)
│
├── nav/                         # Static policy pages
│   ├── about.html               # About page with creator bio
│   ├── contact.html             # Contact information
│   ├── privacy.html             # Privacy policy
│   ├── terms.html               # Terms of service
│   └── disclaimer.html          # Legal disclaimer
│
├── scripts-dev/                 # Automation scripts
│   ├── sitemap-generator.ps1    # Auto-generate sitemap.xml
│   ├── create-partials.ps1      # Generate component files
│   └── ... (other utilities)
│
├── tools/                       # 900+ tool pages, organized by category
│   ├── calculators/
│   ├── converters/
│   ├── pdf/
│   ├── images/
│   ├── text/
│   ├── developer/
│   ├── seo/
│   ├── files/
│   ├── ai/
│   ├── media/
│   └── _tool-template.html      # Template for new tools
│
├── tools-platform/              # Tool discovery pages
│   ├── all-tools.html           # All tools directory
│   └── partials/
│
├── wiki/                        # Documentation and guides
│   ├── html-guide.html
│   ├── css-guide.html
│   ├── javascript-guide.html
│   └── seo-basics.html
│
├── index.html                   # Main homepage
├── sitemap.xml                  # SEO sitemap (auto-generated)
├── robots.txt                   # Crawler directives
├── manifest.webmanifest         # PWA manifest
├── sw.js                        # Service worker for offline support
├── _headers                     # Cloudflare cache headers
├── wrangler.jsonc               # Cloudflare Pages configuration
├── ads.txt                      # AdSense ad identification
├── FullCodeExport.txt           # Full codebase export
├── exportscript.ps1             # PowerShell export utility
├── LICENSE                      # GNU General Public License v3
└── README.md                    # This file
```

---

## 📊 Project Metrics

-   **Total Tools:** 900+
-   **Categories:** 16
-   **Games:** 10
-   **Ready Tools:** 58+
-   **Coming Soon Tools:** 32+
-   **Featured Tools:** 23+
-   **Support Languages:** English, Hindi, French (with i18n framework)
-   **Performance Target:** LCP < 1.5s, CLS < 0.1 (Lighthouse)

---

## 🚀 Data Model & Schema

### tools.json Schema

Each tool in the catalog follows this structure:

```json
{
  "id": "bmi-calculator",
  "name": "BMI Calculator",
  "category": "calculators",
  "subcategory": "health",
  "slug": "/tools/calculators/health/bmi-calculator.html",
  "description": "Calculate your Body Mass Index quickly and easily",
  "status": "ready",
  "featured": true,
  "requiresServer": false,
  "tags": ["health", "calculator", "bmi"],
  "image": "https://www.bluetext.in/assets/img/tools/bmi.png"
}
```

-   **id:** Unique identifier for the tool (lowercase, hyphenated)
-   **name:** Display name of the tool
-   **category:** Primary category (calculators, converters, pdf, images, text, developer, seo, files, ai, media)
-   **subcategory:** Secondary classification for better organization
-   **slug:** Relative URL path to the tool page
-   **description:** Brief description for listings and SEO
-   **status:** Either `"ready"` or `"coming-soon"`
-   **featured:** Boolean indicating if tool appears on homepage
-   **requiresServer:** Whether tool requires backend processing (all false for static build)
-   **tags:** Array of searchable keywords
-   **image:** Optional thumbnail or icon URL

---

## 🔄 Workflow

### Adding a New Tool

1.  **Add to tools.json:**

	Edit `assets/data/tools.json` and add a new entry with all required fields

2.  **Create Tool Page:**

	Copy `tools/_tool-template.html` to the appropriate category folder and customize the content

3.  **Update Navigation (if new category):**

	If adding a new category, update `assets/data/navigation.json` with category metadata

4.  **Regenerate Sitemap:**

	Run from project root:
	```powershell
	./scripts-dev/sitemap-generator.ps1
	```

5.  **Test Locally:**

	Use `live-server` and verify the tool appears in search, categories, and all-tools page

6.  **Commit & Deploy:**

	Push to main branch - Cloudflare Pages will auto-deploy

---

## 🚀 Deployment

This site is configured for **Continuous Deployment** on **Cloudflare Pages**.

-   **Production URL:** https://www.bluetext.in
-   **Repository:** GitHub (connected to Cloudflare Pages)
-   **Build Command:** None (static site)
-   **Output Directory:** `/` (root)
-   **Branch:** `main`
-   **Auto Deploy:** Any push/merge to main branch triggers immediate deployment

### Deployment Files

-   `_headers` - Cloudflare cache policies and security headers
-   `wrangler.jsonc` - Cloudflare Pages configuration
-   `sw.js` - Service worker for offline support and caching

---

## 🛡️ Security & Privacy

-   **No Backend:** All processing happens client-side. No user data is sent to external servers (except analytics)
-   **No Cookies:** The site does not use tracking cookies
-   **Privacy First:** Compliant with GDPR and privacy-focused by design
-   **HTTPS Only:** All traffic is encrypted via Cloudflare SSL
-   **No Ads Tracking:** AdSense ads are served without behavioral tracking

---

## 💬 Support & Contribution

### Getting Help

-   **Discord:** [discord.gg/6gNUAaHaPw](https://discord.gg/6gNUAaHaPw)
-   **Email:** codeon@bluetext.in
-   **GitHub Issues:** Report bugs in the repository

### Contributing

Contributions are welcome! To contribute:

1.  Fork the repository
2.  Create a feature branch: `git checkout -b feature/new-tool`
3.  Make your changes
4.  Commit: `git commit -m 'Add new tool or improvement'`
5.  Push: `git push origin feature/new-tool`
6.  Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU General Public License v3** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

-   Built with vanilla HTML, CSS, and JavaScript for maximum performance
-   Hosted on **Cloudflare Pages** for global distribution
-   Monetized through **Google AdSense**
-   Analytics powered by **Google Analytics (GA4)**
-   Icons and assets from various free sources

---

## 📞 Contact

**Tulsiram Methre**  
AWS Solution Architect | Creator of Bluetext.in

-   Email: codeon@bluetext.in
-   Website: https://www.bluetext.in
-   GitHub: https://github.com/CodeOnYT
-   Twitter: https://twitter.com/Tulsiram_Methre
-   LinkedIn: https://linkedin.com/in/tulsiram-methre

---

**Made with ❤️ by Tulsiram Methre**

_Last updated: May 9, 2026_

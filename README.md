# BlueTEXT

BlueTEXT is a pure static web platform containing free online tools, games, tutorials, software catalogs, and educational resources. Zero external build dependencies required.

## 🚀 Running the Project

BlueTEXT is completely static and can be served using Python standard library:

```bash
# Start local static server (Python 3)
python server.py
# or
python3 server.py
```

Then open `http://localhost:8080` in your browser.

Alternatively, you can open any `index.html` file directly in a modern web browser or host the repository on GitHub Pages, Netlify, Vercel, or any standard static web host with **zero build step**.

---

## 📁 Repository Structure

```
├── index.html                  # Main homepage
├── support.html                # Support and donation page
├── sitemap.xml                 # Search engine sitemap
├── server.py                   # Lightweight Python 3 static web server
├── assets/
│   ├── components/             # Reusable UI templates (header.html, footer.html)
│   ├── css/                    # Consolidated stylesheets (main.css)
│   ├── data/                   # Search index & pre-compiled translation dictionaries
│   └── js/                     # Client-side JavaScript feature scripts (app.js, nav.js, auth.js, theme.js)
├── pages/                      # Content & tool pages
│   ├── tools/                  # Web applications & converters
│   ├── games/                  # Web arcade & puzzle games
│   ├── software/               # Open-source & utility software catalogs
│   ├── tutorials/              # Developer & designer tutorials
│   └── education/              # Learning & study resources
└── AIMemory.md                 # System audit log and architectural memory
```

---

## ⚡ Key Features

- **100% Client-Side**: All converters and tools execute locally in the user's browser.
- **Dark / Light Mode**: Dynamic theme switching with persistent user preference.
- **Offline Multi-Language Support**: Pre-compiled translation catalogs for 20 major languages.
- **Accessibility & Contrast**: Built on Bootstrap 5 UI framework with WCAG 2.1 AA compliance.
- **Zero Package Bloat**: No `node_modules`, npm, or build dependencies required to run or deploy.

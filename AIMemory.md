# AIMemory (Append-Only)

Do not edit or overwrite previous entries.
Always append a new dated entry.

## 2026-06-20

- Project layout moved to assets/components and assets/nav.
- app.js component loader now targets assets/components/header.html and assets/components/footer.html.
- Search and translation data generation scripts were added for scale:
  - scripts/generate-search-index.js
  - scripts/generate-translation-catalog.js
- Legal pages under assets/nav were normalized into valid HTML documents:
  - scripts/normalize-legal-pages.js
- Footer legal links now resolve to assets/nav routes.
- Footer compliance line updated to: "© 2026 BlueTEXT. All tools execute client-side. Zero tracker policy."
- Sitemap generator updated to include assets/nav pages and exclude only non-page assets directories.

## 2026-06-20 (Automation Pipeline Update)

- Added scripts/run-all-generators.js as master orchestration script.
- Added package.json scripts for one-command data build and individual generators.
- New command: npm run build:data
- New report artifact: assets/data/build-report.json
- Report includes per-step status, timestamps, duration, stdout/stderr, and output counts.

## 2026-06-20 (Bootstrap Upgrade)

- Upgraded Bootstrap from 5.3.3 to 5.3.8 across all 98 HTML and JS files.
- CSS SRI: sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB
- JS bundle SRI: sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI
- generate-index-pages.js template also updated.
- Zero 5.3.3 references remain.
- Search runtime uses generated assets/data/search-index.json with fallback to visible links.

## 2026-06-20 (Unified Automation + Global Layout Enforcement)

- Unified all automation flows under scripts/build.js.
- Confirmed sitemap generation is part of the combined script pipeline.
- Updated docs (README.md, Architecture.md, DESIGN.md, Agent.md) to the unified command model.
- Enforced shared component usage across all HTML pages:
  - id="header-component"
  - id="footer-component"
  - /assets/js/app.js loader
- Fixed duplicate markup in assets/components/footer.html to keep a single canonical footer template.
- Standardized empty page stubs to valid component-based HTML shells for site-wide consistency.

## 2026-06-20 (Index Generation & Modern Typography Update)

- Fixed a build script conflict in `scripts/build.js` where walkAndGenerate would dynamically overwrite statically defined top-level pages (like `blog`, `tools`, etc.), causing redundant writes and inconsistencies.
- Improved the dynamic index generation logic in `scripts/build.js` to compare and overwrite `index.html` only when contents change (preventing stale indices when new tools are added/removed).
- Integrated premium modern typography: loaded the Google Font "Inter" in `assets/css/config.css` and applied it to the body element in `assets/css/base.css` across all pages.
- Verified HTML structure and links across all 533 content pages, resolving syntax checks successfully.

## 2026-06-20 (Mobile Optimization & Accessibility Contrast Update)

- Removed the "Beta" badge next to the logo in `assets/components/header.html`.
- Added mobile header action icons (search magnifying glass and person/account outline) in `assets/components/header.html` next to the toggler.
- Integrated a styled, accessible mobile search input inside the navigation collapse menu.
- Registered the new mobile authentication button in `assets/js/auth.js` to ensure login status syncs correctly.
- Added responsive mobile styles and spacing adjustments to `assets/css/footer.css` to provide better breathing room, touch targets, and button layout on small screens.
- Populated `assets/css/themes.css` with high-contrast text colors meeting WCAG 2.1 AA (4.5:1 ratio) requirements and custom focus indicators.
- Added custom accessibility overrides for light/dark mode dropdown menus in `assets/css/header.css` to fix contrast and visibility.

## 2026-06-20 (Optimized Batch Translations & Dark Mode Enforcements)

- Implemented highly optimized batch translation pipeline in `scripts/build.js` that groups unique page strings into chunks (max 50 terms/1500 chars) and translates them in parallel, reducing total requests by 50x and eliminating CORS/rate-limit issues.
- Generated offline lookup dictionaries for 20 major world languages: `/assets/data/i18n/[lang]-dictionary.json`.
- Updated `assets/js/nav.js` to load translation dictionaries locally, resolving preflight redirect CORS errors completely.
- Populated `assets/components/header.html` language selector with 20 major world languages.
- Configured default app layout to load in Dark Mode (setting `data-bs-theme="dark"` directly on the root `index.html` and in `scripts/build.js` page templates) and default to English.

## 2026-06-20 (Complete Build Script Refactor & UI Polish)

- Fully refactored `scripts/build.js` to implement shared HTML directory crawler (`walkHtmlFiles`), concurrent promise pooling (`runPool`), file change validation guards (`writeIfChanged`), and robust argument handling supporting combined execution flags.
- Re-architected Google Translate API requests during build to use custom double-pipe `|||` delimiters, enabling up to 50 terms to be translated in a single HTTP request securely and accurately.
- Redesigned root `index.html` landing page, replacing the unstyled link lists with a gorgeous Bootstrap hero panel and a highly responsive, modern 3-column card grid complete with interactive hover zoom and glow effects.
- Added search and person account SVG icons to the desktop top-bar action buttons in `assets/components/header.html` to match the mobile icons layout.

## 2026-06-20 (Documentation Synchronization & Deployment Preparation)

- Synchronized project architecture documentation (`Architecture.md`), design system guidelines (`DESIGN.md`), and general runbook guides (`README.md`) to reflect the new pre-compiled offline translations pipeline and default dark mode layout.
- Committed and pushed all modified templates, custom scripts, offline dictionary catalogs, sitemaps, and search indices.

## 2026-06-21 (Static Header & Footer Build-Time Compilation)

- Implemented build-time static header and footer compilation (`--inject` flag in `scripts/build.js`) using HTML comment markers (`<!-- HEADER_START -->`, etc.) to fully compile component templates directly into all 533 HTML pages.
- Updated `assets/js/app.js` bootstrap sequence to bypass fetching components dynamically if they are already statically compiled in the DOM, completely resolving client-side layout shifts and loading lag.

## 2026-06-21 (Google Translate Pipeline Fix & Offline zh-TW Conversion)

- Fixed critical Google Translate query bug by joining batch terms with `" ||| "` into a single query parameter `q=`, resolving 400 errors and mapping segment outputs to correct dictionary keys.
- Implemented recursive binary-split fallback inside `translateBatchWithRetry` to automatically split batches when API responses return mismatched delimiter lists or drop segments.
- Excluded Traditional Chinese (`zh-TW`) from remote API translations, instead implementing an offline translation generator using `chinese-conv` to convert `zh-CN` Simplified Chinese into `zh-TW` Traditional Chinese offline in under 10ms.






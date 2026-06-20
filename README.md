# BlueTEXT

BlueTEXT is a static-first content platform for tools, games, tutorials, software catalogs, and education pages.

## Core Stack

- HTML pages under pages/
- Shared UI components in assets/components/
- Shared scripts in assets/js/
- Shared styles in assets/css/
- Generated datasets in assets/data/

## Shared Header and Footer

- Canonical component files:
	- assets/components/header.html
	- assets/components/footer.html
- Every HTML page now uses component mounts:
	- div id="header-component"
	- div id="footer-component"
- Runtime loader:
	- /assets/js/app.js

## Unified Automation

The repository now uses one combined script:

- scripts/build.js

This script handles:

1. Legal page normalization
2. Index page generation
3. Search index generation
4. Translation catalog generation
5. Sitemap generation
6. Build report generation

Run commands from project root:

- npm run build
- npm run build:data
- npm run normalize:legal
- npm run generate:indexes
- npm run generate:search
- npm run generate:i18n
- npm run generate:sitemap

## Output Artifacts

- assets/data/search-index.json
- assets/data/i18n/en-catalog.json
- assets/data/i18n/[lang]-dictionary.json (for 20 major world languages)
- assets/data/build-report.json
- sitemap.xml

## Privacy and Compliance Baseline

BlueTEXT is client-side-first for tool execution, with no mandatory user tracking in core tool workflows.

Implemented baseline pages:

- assets/nav/privacy.html
- assets/nav/terms.html
- assets/nav/disclaimer.html
- assets/nav/security.html
- assets/nav/accessibility.html
- assets/nav/compliance.html

## Accessibility Baseline

- Semantic landmarks and heading structure
- Keyboard-reachable navigation and dialogs
- ARIA labels and live regions for dynamic content
- Theme mode support and visible focus

## Important Compliance Note

The codebase includes implementation controls aligned to GDPR, CCPA, PIPL, LGPD, DPDP, and WCAG 2.2 AA practices. Formal legal compliance still requires legal review and periodic audits.

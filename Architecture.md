# Architecture

## High-Level Model

BlueTEXT uses a static-site architecture with generated data files for runtime features.

- Shell: index.html
- Reusable layout: assets/components/header.html and assets/components/footer.html
- Feature scripts: assets/js/*.js
- Generated runtime data: assets/data/*.json
- Content pages: pages/**/*.html
- Policy pages: assets/nav/*.html

## Runtime Boot Sequence

1. index.html loads Bootstrap and assets/js/app.js
2. app.js injects reusable components into shell mounts
3. app.js hoists modals to body for stable Bootstrap layering
4. app.js loads data and dispatches readiness events
5. feature modules initialize on bt:components-ready and bt:data-ready

## Feature Modules

- nav.js
	- search powered by assets/data/search-index.json
	- language translation workflow loading pre-compiled dictionary files at assets/data/i18n/[lang]-dictionary.json for 20 major world languages
	- clear cache utility
- auth.js
	- local sign up/sign in/sign out
	- persisted user session in localStorage
- theme.js
	- dark/light mode button with persisted preference

## Data Generation Layer

- scripts/build.js
	- unified automation entry point
	- normalizes legal pages under assets/nav
	- generates index pages under pages
	- generates search index and translation catalog
	- generates sitemap.xml
	- writes build report to assets/data/build-report.json

### Script Commands

- npm run build
- npm run build:data
- npm run normalize:legal
- npm run generate:indexes
- npm run generate:search
- npm run generate:i18n
- npm run generate:sitemap

## Compliance and Accessibility Structure

- policy pages under assets/nav
- footer links point to policy pages
- semantic headings and landmarks
- modal and navigation controls are keyboard reachable

## Scalability Strategy

The project avoids manual page-by-page feature wiring by using the unified generator pipeline for legal normalization, index pages, search, translation extraction, and sitemap updates.

## Global Layout Enforcement

- Canonical shared layout files:
	- assets/components/header.html
	- assets/components/footer.html
- Canonical runtime injector:
	- assets/js/app.js
- All HTML pages in the repository now use shared component mounts:
	- id="header-component"
	- id="footer-component"

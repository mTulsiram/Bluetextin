# Bolt's Journal

## 2026-08-05 - [Debounce and Pre-computed Lowercase for Search]
**Learning:** In client-side search engines with large catalogs (500+ items), repeatedly running string operations (like `.toLowerCase()`, `.includes()`) on multiple properties inside the filtering loop on every keystroke can block the main thread and degrade typing performance. Pre-computing lowercase properties on catalog fetch and introducing a 150ms debounce for the search input dramatically reduces CPU usage and DOM layout reflows.
**Action:** Always pre-compute search strings upon initial fetch/load, and debounce input event handlers.

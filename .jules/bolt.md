# Bolt's Journal - Critical Learnings Only

## 2026-08-04 - Debouncing and Pre-computing Catalog Search Properties
**Learning:** Directly filtering a large JSON search index on every keystroke in a client-side catalog can cause severe main-thread blockages, high CPU utilization, and rapid layout reflows. By pre-computing lowercased search targets (`_titleLower`, `_descLower`, `_keywordsLower`) during the initial fetch step and adding a 150ms debounce function to the search input, filter calculations are reduced from hundreds of raw comparisons per keystroke to a controlled single execution, dramatically reducing frame drop rates and CPU usage.
**Action:** Avoid calling `.toLowerCase()` in hot render/filter loops; map the data once during loading. Always debounce real-time search input events on client-side catalogs to prevent blocking the event loop.

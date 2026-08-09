# Bolt's Journal - Critical Learnings Only

## 2026-08-09 - Precomputations & Input Debouncing on Catalog Search
**Learning:** Performing multiple string lowercase mappings, substring checks, and regular expression lookups inside a hot synchronous filtering/render loop is an expensive bottleneck on client-side catalogs with hundreds of records. Rapid typing triggers immediate layout reflows and filter iterations on every single keystroke.
**Action:** Always precompute lowercased properties (`_titleLower`, `_descLower`, `_keywordsLower`) and cache resource categories (`_category`) immediately when fetching dataset catalogs. Wrap the search input listener with a lightweight 150ms debounce function to coalesce keystrokes, reducing rendering overhead and preventing layout reflow churn.

## 2026-08-13 - Client-side Catalog Search Optimization
**Learning:** Client-side catalog filtering on index pages with large datasets (500+ items) experiences significant performance degradation when string lowercasing, property mapping, and DOM updates are executed synchronously on every single input keystroke.
**Action:** Pre-compute lowercase properties (`_titleLower`, `_descLower`, `_keywordsLower`) on initial JSON fetch, use them during search filtering, and implement a 150ms debounce on input events to prevent layout thrashing and redundant filter passes.

## 2026-08-06 - Optimized Catalog Search Engine
**Learning:** Client-side list searching and filtering on keystrokes causes massive layout reflows and redundant UI filtering operations when typing quickly. This is worsened by invoking string manipulation and dynamic categorization on every array item per keypress.
**Action:** Always precompute static properties (like lowercase titles, descriptions, and category tags) upon fetch/load, and debounce input search handlers (e.g. 150ms) to reduce redundant DOM rendering passes.

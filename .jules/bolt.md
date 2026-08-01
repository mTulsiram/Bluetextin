# Bolt's Performance Optimization Journal

## 2026-07-25 - [Header Injection Causes Keyword Pollution in Search Index]
**Learning:** In the BlueTEXT build pipeline, header and footer components are injected into pages before generating the search index (`search-index.json`). Because the search index generator uses HTML stripping to build keywords, the keywords for *every single page* end up containing all navigation link labels from the global header. This results in keyword pollution where search terms like "Math" or "Games" return 100% of the pages on the site (534+ items), making client-side search execution a significant performance bottleneck during continuous keystrokes.
**Action:** Prioritize lightweight debouncing (e.g., 150ms delay) on the search input to avoid redundant matching & DOM rendering, and pre-compute lowercased search keys (haystack) during index loading to avoid expensive string template interpolation and `.toLowerCase()` operations across 500+ items on every keystroke.

## 2026-08-01 - [Resolving Search-Index Layout Pollution & Client-Side Search Overheads]
**Learning:** Stripping HTML directly from pages with injected global templates inflates search index sizes and causes 100% false-positive search results for common navigation terms. Removing layout blocks before parsing reduces index file sizes by ~27% (~125KB savings) and sanitizes keyword search. Additionally, pre-computing lowercase lookup strings at index load eliminates O(N) runtime overheads per keystroke.
**Action:** Keep build scripts aligned so dynamic components are excluded from static text analyzers. Use client-side debouncing and lookup cache structures to preserve 60fps responsiveness on large catalogs.

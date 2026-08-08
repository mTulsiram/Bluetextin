# Bolt's Journal - Critical Learnings Only

## 2026-08-08 - [Optimizing Client-Side Instant Search Catalogs]
**Learning:** Performing multiple `.toLowerCase()` operations and string includes matching on large catalogs (500+ items) during input events creates a noticeable rendering lag and blocks the main thread because it triggers layout reflows on every single keystroke. Mapping and pre-computing lowercase properties (`_titleLower`, `_descLower`, `_keywordsLower`) once upon fetch reduces redundant allocations.
**Action:** Always pre-compute lowercase or normalized values for properties being searched inside catalogs, and use input event debouncing (e.g., 150ms) to batch and group rendering updates.

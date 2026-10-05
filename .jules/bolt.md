# Bolt Performance Journal

## 2026-10-05 - Parallel Static Page Seed Generation
**Learning:** Sequential disk I/O operations inside `generateIndexPages()` static page loops block the event loop needlessly when writing HTML files and creating directories for static pages.
**Action:** Use `Promise.all` across independent page items so filesystem calls execute concurrently and sum results using `.reduce()` to safely eliminate state mutation.

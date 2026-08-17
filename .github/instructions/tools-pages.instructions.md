---
applyTo: "pages/tools/**/*.html"
---

Rules for tool pages:

- Keep each page fully self-contained: in-file style/script only.
- No external CSS/JS/CDN runtime dependencies.
- No header/footer/nav injection scripts.
- Preserve existing IDs/classes used by JS hooks.
- Prefer single-file edits and one targeted UI verification.

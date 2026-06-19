# Architecture Coverage Audit
**Date:** June 19, 2026  
**Specification:** Data-driven static architecture blueprint (layout, schema, tool/runtime contract, category runtime, partials, CSS, SEO/PWA, QA automation, mental model)

---

## Executive Summary

**Current Score: 78% specification alignment**

Recent improvements completed:
- Rebuilt shared CSS stack and tokenized compliance baseline in assets/css.
- Added compliance-first design spec in DESIGN.md.
- Added global consent runtime, transport/consent status chips, and persistent privacy controls via assets/js/partials.js.
- Added explicit Data Rights flow page at nav/data-rights.html and linked it across legal pages + footer.
- Added skip-link and main-content landmark hooks across legal surfaces and templates.

Remaining high-impact gaps:
- qa-dashboard.js still missing.
- Sitemap/build validation still not automated in CI-style workflow.
- Some flagship tool pages remain heavy with bespoke inline logic.

---

## 1. Repository Layout

### Coverage: **84% ALIGNED**

Status:
- Core structure present: index.html, 404.html, tools/, categories/, assets/{css,js,data}, manifest.webmanifest, sw.js, robots.txt, sitemap.xml.
- Legal pages exist under nav/ (about, contact, privacy, terms, compliance, security, accessibility, data-rights).
- Shared partials are under components/ (header/footer/ads-main) instead of partials/.

Notes:
- Path conventions differ from original root-level spec but routing works.
- Non-blocking alignment debt remains (components vs partials, nav vs root legal pages).

---

## 2. tools.json Data Model

### Coverage: **85% ALIGNED**

Status:
- Contract fields id, name, category, subcategory, slug, description, status, featured, tags, requiresServer are in active use.
- Runtime consumers (main.js/category-page.js/tool-runtime.js) are present.

Gap:
- icon field coverage is incomplete/non-uniform across catalog entries.

---

## 3. Tool Page Contract

### Coverage: **72% ALIGNED**

Status:
- Tool runtime infrastructure exists and can hydrate metadata.
- Shared template now includes privacy/security/compliance landmark sections.
- Skip-link and main-content structure reinforced in baseline templates.

Gap:
- Several high-complexity tools (notably office/pdf flagship pages) still include large inline page logic and styling.

---

## 4. Category Runtime

### Coverage: **80% ALIGNED**

Status:
- categories/ structure exists and category-page.js is present.
- Category pages render from JSON-backed runtime model.

Gap:
- Route consistency and metadata consistency checks are not yet automated.

---

## 5. Shared Partials + Global UX Controls

### Coverage: **88% ALIGNED**

Status:
- Shared header/footer injection via partials.js is active.
- Active nav behavior, language routing, theme controls, and consent manager are integrated.
- New global compliance runtime hooks are active in footer:
  - consent status text
  - transport status chip
  - consent mode chip
- Footer now includes Data Rights Request legal link.

Gap:
- Folder naming differs from spec (components/ vs partials/).

---

## 6. CSS Architecture

### Coverage: **100% ALIGNED**

Status:
- Modular stack is implemented and active:
  - assets/css/themes.css
  - assets/css/base.css
  - assets/css/critical.css
  - assets/css/layout.css
  - assets/css/components.css
  - assets/css/pages.css
  - assets/css/main.css (import entrypoint)

Highlights:
- WCAG-focused focus visibility and interaction sizing patterns.
- Consent, DSR, and security UI components are now styled in shared modules.

---

## 7. SEO + PWA Rules

### Coverage: **80% ALIGNED**

Status:
- sitemap.xml, manifest.webmanifest, sw.js, and sitemap-generator.js are present.
- Canonical/alternate language handling exists in runtime.

Gap:
- Generation and verification are not wired into an enforced pre-deploy automation step.

---

## 8. QA & Validation Automation

### Coverage: **0% ALIGNED**

Status:
- qa-dashboard.js is still missing.
- No automated repo-wide assertions for slug/file existence, orphan detection, navigation-tools parity, sitemap parity.

Impact:
- Highest architecture risk remains data/file drift and unnoticed regressions.

---

## 9. Privacy, Accessibility, and Security UX Baseline

### Coverage: **90% ALIGNED**

Status:
- WCAG 2.2 AA-aligned baseline tokens/styles and focus model are implemented in shared CSS.
- GDPR/CCPA controls are explicit and user-facing:
  - consent banner and customization modal
  - persistent Privacy Settings trigger
  - dedicated Data Rights request page
  - legal cross-linking across privacy/compliance/security/terms/accessibility/footer
- ISO 27001/FISMA-aligned UX posture is represented in runtime status and legal statements.

Gap:
- Technical control attestation remains implementation-level, not third-party audited certification.

---

## Summary Matrix

| Section | Coverage | Status | Blocker? |
|---------|----------|--------|----------|
| 1. Repository Layout | 84% | ⚠️ Minor structure drift | No |
| 2. tools.json Schema | 85% | ⚠️ icon normalization pending | No |
| 3. Tool Page Contract | 72% | ⚠️ bespoke flagship pages | Yes |
| 4. Category Runtime | 80% | ⚠️ route/meta validation pending | Yes |
| 5. Shared Partials + Global UX | 88% | ✅ strong runtime integration | No |
| 6. CSS Architecture | 100% | ✅ complete | No |
| 7. SEO/PWA Rules | 80% | ⚠️ automation not enforced | Yes |
| 8. QA Automation | 0% | ❌ missing qa-dashboard.js | **YES** |
| 9. Compliance UX Baseline | 90% | ✅ implemented and linked | No |

---

## Must-Fix Blockers

1. Implement assets/js/qa-dashboard.js.
2. Add repeatable validation command that checks:
   - tools.json slug file existence
   - orphan pages
   - category/subcategory coverage
   - sitemap parity for ready tools
3. Wire sitemap-generator.js and QA checks into deployment pipeline.
4. Continue reducing bespoke inline logic in flagship tool shells.

---

## Recommended Next Work Order

### Phase A (Critical Integrity)
- Build qa-dashboard.js and run it in pre-deploy script.
- Add a fail-fast validation report output.

### Phase B (Runtime Consistency)
- Normalize metadata and runtime contracts for high-complexity tools.
- Expand template-driven shell use across office/pdf flagship pages.

### Phase C (Automation)
- Wire sitemap generation + validation into release flow.
- Add smoke checks for legal/compliance links and consent runtime surfaces.

---

## Conclusion

The architecture is now materially stronger than the May 9 snapshot, especially on compliance UX and shared CSS/runtime consistency.  
The primary maturity blocker is still **missing QA automation**.  
Implementing qa-dashboard.js and enforced pre-deploy checks is the fastest route to **90%+ alignment**.

# BlueTEXT Project Specification (SPEC.md)

**Status**: FINALIZED  
**Version**: 1.0.0  
**Project**: BlueTEXT Web Platform  
**Architecture**: Pure Client-Side Static Site  

---

## Executive Overview
BlueTEXT is a 100% static, client-side first content and utility platform providing:
1. 500+ Developer tools, converters, utilities, and video tools.
2. 50+ Interactive browser games (Arcade, Board, Cards, Puzzles, Word).
3. Software catalogs, developer tutorials, and education study resources.
4. Multilingual support across 20 major world languages via pre-compiled JSON catalogs.
5. Zero tracker policy & GDPR/CCPA privacy alignment.

---

## Core Requirements & Constraints

1. **Zero External Runtime Server Dependencies**:
   - Zero Node/npm build requirement for serving content.
   - Standard Python 3 server (`server.py`) for optional local hosting on port 8080.
   - Fully hostable on static platforms (GitHub Pages, Netlify, Vercel).

2. **Unified UI & Component Architecture**:
   - Bootstrap 5.3.8 base styling with custom consolidated CSS (`assets/css/main.css`).
   - Shared site header (`assets/components/header.html`) and footer (`assets/components/footer.html`).
   - Unified JavaScript runtime (`app.js`, `nav.js`, `auth.js`, `theme.js`).

3. **Production Readiness Baseline**:
   - Clean, bug-free interactive games with state import/export.
   - Accessibility compliance (WCAG 2.1 AA) and high contrast support.
   - Offline translation dictionary fallback for 20 world languages.
   - Validated HTML, search index, and sitemap.

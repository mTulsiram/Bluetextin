# PRODUCT.md — BlueTEXT.in Product Context

> This file is read by every `/impeccable` command. Keep it up to date.

## Product Identity

- **Name**: BlueTEXT.in
- **Brand name**: BlueTEXT *(the `.in` is the domain TLD — Indian ccTLD — not part of the word)*
- **Tagline**: Edit like a pro, without the price tag.
- **Category**: Browser-based video editing tool (NLE)
- **URL**: bluetext.in
- **Differentiation note**: Distinct from "Bluetext" (a US digital agency). Always write **BlueTEXT.in** in marketing copy — the `.in` suffix and the capitalisation of TEXT are the visual separators.

## What it is

**BlueTEXT.in** is a free, browser-based video editor. It competes with CapCut, Filmora, and Canva Video — not with Premiere Pro. Users want results fast. They do not want to learn software.

The product has two surfaces:
1. **The editor tool** — where users spend most of their time (single-file HTML app)
2. **The marketing site** — where new users arrive and decide to try it

## Who uses it

**Primary**: Educators and trainers making course videos, tutorials, and screencasts.  
**Secondary**: Anyone who needs to edit video without paying for a desktop app.

**Platform split**:
- Web (desktop browser) — primary
- Android — secondary
- iOS — secondary
- Windows desktop (Electron or PWA) — edge case
- Tablet — edge case

**Tech comfort**: Low to medium. Users do not know what a codec is. They just want to trim, add text, export.

## Business model

Free forever (ad-supported or freemium). The free tier must be fully functional — no artificial limits that frustrate users.

Pro tier can offer: higher export resolution, no watermark, more storage, team collaboration.

## Competitors (and what we must beat them on)

| Competitor | Where we win |
|-----------|-------------|
| CapCut | Privacy (browser-only, no forced account), full timeline |
| Filmora | Free, no watermark on free tier |
| Canva Video | More control, true timeline editing |
| iMovie | Cross-platform, browser-based, no install |

## Brand Separation

**BlueTEXT.in** must be visually distinct from **Bluetext** (a US-based digital marketing agency, bluetext.com).

Rules for all brand touchpoints:
- Always write **BlueTEXT.in** — not Bluetextin, not Bluetext, not Blue Text
- The capitalised **TEXT** signals the text/subtitle/editing focus
- The **.in** is always visible — it anchors the Indian origin and differentiates from bluetext.com
- In compact/icon contexts where `.in` cannot fit: use the **BT** monogram
- Brand color `#20d59b` (teal-green) must never be the same blue used by the Bluetext agency

## Accessibility requirements

- **WCAG AA** compliance minimum across all surfaces
- Keyboard-navigable timeline and controls
- Screen reader labels on all interactive elements
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- No motion for users with `prefers-reduced-motion: reduce`

## Language

English primary. Architecture must support future i18n (string externalization, no hardcoded UI text in CSS content).

## Voice & tone

**Friendly and capable.** Like a smart friend who happens to know video editing.

- ✅ "Drop your video here to get started."
- ✅ "Looks like that file isn't supported. Try MP4 or WebM."
- ❌ "Invalid media format detected."
- ❌ "Welcome to the BlueTEXT.in Professional Video Editing Suite!"
- ❌ Never write "Bluetextin" as a brand name in UI or marketing copy

Short sentences. Action verbs. No jargon. Never condescending.

## Anti-references (what NOT to look like)

- DaVinci Resolve — too dense, intimidating
- Adobe Premiere — too complex for our audience
- Windows Movie Maker — too legacy, cheap-looking
- Any tool with a giant "UPGRADE NOW" modal blocking the editor

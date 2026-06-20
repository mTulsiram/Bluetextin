# Agent Runbook

## Purpose

This file defines how automation and coding agents should work in this repository.

## Always Do

1. Treat assets/components as the source for reusable header and footer.
2. Treat assets/nav as the source for policy/legal pages.
3. Regenerate search index, translation catalog, and sitemap after content structure changes.
4. Keep accessibility and compliance notes synchronized with implementation.
5. Enforce shared layout mounts in all HTML pages:
	- id="header-component"
	- id="footer-component"

## Required Generator Commands

1. node scripts/build.js
2. node scripts/build.js --legal
3. node scripts/build.js --indexes
4. node scripts/build.js --search
5. node scripts/build.js --i18n
6. node scripts/build.js --sitemap

## Path Rules

- Do not use legacy components/ or nav/ paths.
- Use assets/components/ and assets/nav/ paths.

## Append-Only Memory Rule

- Use AIMemory.md as append-only log.
- Never overwrite existing entries.
- Add new dated entries at the end.

## Compliance and Accessibility Rule

- Keep implementation aligned with GDPR, CCPA, PIPL, LGPD, DPDP, and WCAG 2.2 AA baseline requirements.
- Keep legal wording and compliance claims realistic; do not claim formal certification without audit evidence.

# BlueTEXTin Design And Compliance Standard

Version: 2026-06-19
Scope: All web pages, tools, forms, office simulators, and shared UI components.

## 1) Compliance Baseline

This system is designed to meet and sustain:

- WCAG 2.2 AA accessibility baseline
- GDPR and CCPA privacy control baseline
- ISO 27001 and FISMA aligned UX/security baseline
- UX4G-style public service UX principles: clear language, inclusive access, mobile-first usability, trust signals, and consistent service journeys

## 2) Design Principles

- Clarity first: plain language, short labels, clear system status, no hidden actions
- Inclusive by default: keyboard-first interactions, readable hierarchy, visible focus, accessible errors
- Trust-centered: explicit privacy choices, explain data use, show security state and consent status
- Mobile-first: touch-safe controls (minimum 44x44), responsive layout at every breakpoint
- Consistency at scale: token-driven styling only through shared CSS layers

## 3) Token Contract

All visual values come from CSS custom properties in `assets/css/themes.css`.

Required tokens include:

- Surfaces: `--bg-canvas`, `--bg-card`, `--surface-soft`, `--surface-strong`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Action: `--accent-primary`, `--accent-primary-hover`, `--accent-contrast`
- States: `--success`, `--warning`, `--danger`, `--info`
- Accessibility: `--focus-ring`, `--focus-bg`
- Geometry: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`
- Spacing: `--space-1` to `--space-6`

Do not introduce hardcoded color values in page-level HTML.

## 4) Accessibility Requirements (WCAG 2.2 AA)

### 4.1 Perceivable

- Text contrast minimum 4.5:1 for normal text, 3:1 for large text and UI components.
- Non-text contrast minimum 3:1 for controls, focus indicators, and meaningful graphics.
- Do not use color as the only way to convey state.

### 4.2 Operable

- All interactive controls reachable and actionable by keyboard.
- Visible focus ring on all focusable elements.
- Target size minimum 44x44 CSS pixels for primary interactions.
- No keyboard traps; escape and close actions must be available for dialogs.

### 4.3 Understandable

- Every form control has a programmatic label.
- Errors include clear text and recovery guidance.
- Maintain predictable navigation and component behavior.

### 4.4 Robust

- Use semantic HTML landmarks and valid ARIA only when necessary.
- Test with screen readers and high-contrast/forced-colors mode.

## 5) Privacy Controls (GDPR/CCPA)

The UI must expose these controls clearly:

- Consent banner with explicit actions: Accept all, Reject non-essential, Manage preferences
- Category-level consent toggles (essential, analytics, personalization, marketing)
- Data rights request UI for access, deletion, correction, portability, and opt-out requests
- Privacy notices adjacent to data collection fields
- Revocation path available at all times (for example through footer privacy controls)

Use classes from `assets/css/pages.css`:

- `consent-banner`, `consent-actions`, `consent-preferences`, `consent-toggle`
- `dsr-panel`, `dsr-grid`

## 6) Security Baseline (ISO 27001/FISMA aligned)

UI and frontend architecture shall support:

- Least privilege patterns in admin and moderation interfaces
- Clear session state and timeout warnings where authentication exists
- Security event visibility (for example `security-chip` status indicators)
- Safe defaults: no hidden tracking, no unsafe third-party execution by default
- Input validation messaging without exposing internals or stack details

Note: Technical controls such as encryption, secure headers, logging, key management, and vulnerability management must be enforced server-side in parallel.

## 7) UX4G Alignment Guidelines

Follow these implementation behaviors:

- Citizen-first content structure: start with user task, not system structure
- Multilingual support readiness and language discoverability in navigation
- Consistent, reusable component patterns across all service pages
- Inclusive readability: moderate line lengths, clear spacing, and plain language
- Service confidence cues: visible support links, policy links, and status feedback

## 8) CSS Architecture

- `assets/css/themes.css`: design tokens and theme variants
- `assets/css/base.css`: reset, typography, links, focus, motion safety
- `assets/css/critical.css`: first-render essentials
- `assets/css/layout.css`: container/grid/layout helpers
- `assets/css/components.css`: buttons, forms, alerts, tables, dialog, badges
- `assets/css/pages.css`: page-level patterns including consent/privacy/security surfaces
- `assets/css/main.css`: module import entrypoint

No inline style attributes in production pages.

## 9) Mandatory QA Gate

Before merge/deploy, every release must pass:

- Automated accessibility checks (keyboard, contrast, semantics)
- Manual keyboard-only navigation review
- Manual screen-reader smoke tests on critical flows
- Consent and privacy flow validation (accept/reject/manage/revoke)
- Responsive behavior checks on small and large screens
- Regression check for focus visibility and error messaging

## 10) Implementation Notes For This Repo

- This repository has multilingual routes and tool pages; shared CSS must remain route-safe and token-driven.
- Components should consume `main.css` and avoid ad hoc style blocks.
- Any future redesign must preserve this compliance baseline unless a stricter policy supersedes it.


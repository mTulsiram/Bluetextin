# BlueTEXTin Constitution

## Core Principles

### I. Serverless & Local-First Processing
All text analysis, files, converters, graphic manipulation, media playback, and calculations must execute entirely in the user's browser memory (local sandboxed runtime). No user content, documents, or personal data can be transmitted to external servers.

### II. Universal Compliance-First Design
Every user interface and tool must enforce the Master Compliance Stack:
1. **WCAG 2.2 AA digital accessibility**: Text contrast ratios > 4.5:1, thick visible focus indicators (`box-shadow`), strict tab flows, and screen-reader ARIA labeling.
2. **Global User Privacy**: Opt-in gates for GDPR/ePrivacy, opt-out triggers for CCPA, data fiduciary controls for DPDP (India), localized storage declarations for PIPL (China), and DPO endpoints for LGPD (Brazil).

### III. Deep Subfolder Routing & Clean URLs
To support a high-fidelity visual dashboard and clear site navigation, files must match these directory protocols:
1. `/tools/`: Must be strictly two levels deep (e.g., `/tools/images/jpeg-compressor.html`).
2. `/games/`, `/software/`, `/tutorials/`, and `/education/`: Organized by category folders containing individual `index.html` files.

### IV. Relative Asset Resolution
No page, script, or stylesheet can rely on hardcoded absolute paths (`/assets/...`). All references must resolve relatively (e.g., `../../assets/css/main.css`) to ensure the website is fully functional when run locally via the browser's `file:///` protocol.

### V. Gated Third-Party Integrations
Advertising tags (Google AdSense via IAB TCF v2.2), conversion tracking (Google Analytics, Facebook Pixel), payment gateways (Stripe Elements, Razorpay Checkout), and store widgets (Gumroad) must load dynamically and only after resolving matching privacy consent states.

## Governance
This Constitution establishes the baseline for all features. Any additions to the tools, games, software, or tutorial suites must verify compliance with accessibility and privacy controls before deployment.

**Version**: 1.0.0 | **Ratified**: 2026-06-20

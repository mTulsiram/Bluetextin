# Feature Specification: BlueTEXTin Platform Ecosystem

**Feature Branch**: `001-bluetext-suite`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Complete compliance-focused serverless utility suite containing tools, games, software, tutorials, and education subcategories."

---

## User Scenarios & Testing (Priority: P1)

### User Story 1 - Local Serverless Utility Access (Priority: P1)
As a developer or content writer, I want to access tools (like Base64 converters, SVG optimizers, and JSON formatters) completely locally in my browser without internet connection or database queries, so that my processed data remains private and secure.

**Why this priority**: Core value proposition of BlueTEXT.in is instant, private offline tools.
**Independent Test**: Can be tested by opening pages via local `file:///` protocols and verifying functionality works with internet connection disabled.
**Acceptance Scenarios**:
1. **Given** a locally served page, **When** a user drops a file or inputs text, **Then** the output must generate in real-time in memory.
2. **Given** network requests are blocked, **When** a user runs a conversion utility, **Then** no network telemetry or input data is transmitted.

---

### User Story 2 - Keyboard & Accessibility Access (Priority: P1)
As a user with visual or physical motor disabilities, I want to fully navigate, trigger, and use the tools, games, and wikis using only a keyboard and a screen reader.

**Why this priority**: Mandatory legal compliance globally (EAA, ADA Title III, Section 508, ACA).
**Independent Test**: Perform keyboard-only navigation (Tab, Shift+Tab, Enter, Space) and read-out checks.
**Acceptance Scenarios**:
1. **Given** focus is shifted to an input or button, **When** tabbed to, **Then** a visible focus ring (`box-shadow`) must immediately outline the element.
2. **Given** a drag-and-drop zone, **When** a user hits Enter/Space on keyboard focus, **Then** the local file dialog must open.

---

### User Story 3 - Regional Compliance Routing & Signalling (Priority: P2)
As a global visitor from the EU, USA, India, China, or Brazil, I want my browser region to be detected and served matching privacy toggles and advertising permissions.

**Why this priority**: Required for global monetization and avoiding severe regulatory fines (GDPR, CCPA, DPDP, PIPL, LGPD).
**Independent Test**: Toggle client region settings in footer and verify script loads.
**Acceptance Scenarios**:
2. **Given** a user is from the EU, **When** loading the page, **Then** no tracking scripts (AdSense/Analytics/Pixel) load until "Accept" consent is clicked.
3. **Given** a user is in India, **When** checking consent options, **Then** separate toggles for utility local storage and ad scripts are available.

---

### User Story 4 - E-Commerce & Donation Integrations (Priority: P2)
As a supporter, I want to donate via Patreon or Buy Me a Coffee, and buy templates/software via Gumroad inside a safe checkout frame.

**Why this priority**: Monetization layer.
**Independent Test**: Trigger checkouts and verify card input fields are encapsulated in Stripe/Razorpay/Gumroad frames.
**Acceptance Scenarios**:
1. **Given** a product card is clicked, **When** the checkout overlay loads, **Then** card fields must be loaded securely via iframe directly from the payment gateway (PCI-DSS SAQ A).

---

## Functional Requirements

### FR-001: Zero-Backend Execution
The platform MUST execute all conversion, formatting, gaming, and editing logic 100% client-side in the browser.

### FR-002: Category Folder Hierarchy
The repository directories MUST be organized as follows:
- `/tools/`: General utilities grouped under `/tools/images/`, `/tools/videos/`, `/tools/office/`, `/tools/coding/`, `/tools/math/`, `/tools/converters/`, `/tools/network/`, `/tools/lifestyle/`, `/tools/utilities/`, and `/tools/data/` (2 levels max).
- `/games/`: Grouped under `/arcade/`, `/puzzles/`, `/board/`, `/cards/`, and `/word/`.
- `/software/`: Grouped by platform (windows, linux, android, apple) and type (utility, productivity, development, design, etc.).
- `/tutorials/`: Categorized by developer fields.
- `/education/`: Categorized by academic fields.

### FR-003: Relative Paths Integration
All stylesheet, script, and template references MUST be relative (e.g. `../../assets/css/main.css`) to support file protocol parsing.

### FR-004: Ad & Analytics Consent Gating
Third-party script assets (Google AdSense via IAB TCF v2.2, Google Analytics, Facebook Pixel) MUST only load dynamically after resolving explicit client consent string registries.

---

## Success Criteria

### Measurable Outcomes
- **SC-001**: 100% of tools must function offline and under local file protocol `file:///`.
- **SC-002**: Screen contrast ratio MUST equal or exceed `4.5:1` on all text elements.
- **SC-003**: 100% of interactive widgets must be reachable and triggers operable via keyboard keys (`Tab`, `Enter`, `Space`).
- **SC-004**: Checkout and donation transactions offloaded to third-party frames, achieving 100% PCI-DSS SAQ A compliance.

---

## Assumptions
- Users have standard, modern browsers supporting ES6+ Javascript and local storage.
- Cloudflare Pages will host the static frontend assets and subdomains.
- No server-side databases are utilized.

# Design System & Accessibility Specification (DESIGN.md)

This document establishes the official design system, typography tokens, visual guidelines, and digital accessibility protocols for **BlueTEXT.in**. To ensure the platform is universally usable, compliant, and aesthetically premium, all tools must align strictly with the standards described below.

---

## 1. Aesthetic Identity: Premium Neon Cyber-Glassmorphism
BlueTEXT.in uses a curated neon-glass theme. The layout feels alive, futuristic, and responsive through subtle micro-animations and glowing layers.

### UI Tokens & CSS Properties
```css
:root {
  /* Typography */
  --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Color Palette - Cyber Glass (Dark Mode Default) */
  --bg-canvas: #090b10;
  --bg-card: rgba(17, 22, 34, 0.7);
  --bg-card-hover: rgba(25, 32, 50, 0.85);
  
  /* Text Contrast - WCAG 2.2 AA Complaint (4.5:1 minimum, actual > 7:1) */
  --text-primary: #f3f4f6;       /* White-grey (Contrast > 10:1 against canvas) */
  --text-secondary: #d1d5db;     /* Light-medium grey (Contrast > 7:1 against canvas) */
  --text-muted: #9ca3af;         /* Medium-light grey (Contrast > 4.8:1 against canvas) */

  /* Accents & Neon Highlights */
  --accent-primary: #3b82f6;           /* Electric Blue */
  --accent-primary-glow: rgba(59, 130, 246, 0.35);
  --accent-primary-hover: #60a5fa;
  --accent-secondary: #8b5cf6;         /* Royal Violet */
  --accent-secondary-glow: rgba(139, 92, 246, 0.35);
  --accent-success: #10b981;           /* Emerald Green */
  --accent-danger: #ef4444;            /* Neon Red */
  --accent-warning: #f59e0b;           /* Amber Gold */

  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-focus: #3b82f6;

  /* Geometry & Spacing */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 9999px;

  /* Glassmorphism Configuration */
  --glass-blur: blur(16px);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="light"] {
  --bg-canvas: #f8fafc;
  --bg-card: rgba(255, 255, 255, 0.8);
  --bg-card-hover: rgba(255, 255, 255, 0.95);
  
  --text-primary: #0f172a;       /* Dark slate (Contrast > 15:1 against canvas) */
  --text-secondary: #334155;     /* Slate (Contrast > 9:1 against canvas) */
  --text-muted: #475569;         /* Light slate (Contrast > 6:1 against canvas) */

  --accent-primary: #2563eb;
  --accent-primary-glow: rgba(37, 99, 235, 0.15);
  --accent-primary-hover: #1d4ed8;
  --accent-secondary: #7c3aed;
  
  --border-subtle: rgba(15, 23, 42, 0.12);
  --border-focus: #2563eb;
  --glass-shadow: 0 8px 32px 0 rgba(15, 23, 42, 0.06);
}
```

---

## 2. Digital Accessibility (Universal Access Rules)
To satisfy the European Accessibility Act (EAA), US ADA Title III, Section 508, and the Accessible Canada Act (ACA), the following parameters must be programmatically enforced across all 1,000+ local tools:

### A. Color Contrast Compliance
- **Text & UI Elements**: All text elements (headers, tool labels, outputs) must maintain a contrast ratio of at least `4.5:1` against their containing backgrounds. Large text (> 18pt or bold > 14pt) must maintain a minimum contrast ratio of `3:1`.
- **Contrast Checkers**: Verify all colors via static analysis. Do not use opacity on text layers that reduces contrast below compliance thresholds.

### B. Keyboard Operability (Full Mouse-Free Control)
All utilities must be fully functional using only a keyboard.
1. **Interactive Focus Ordering**: Ensure a logical tab order matching the visual workflow using standard semantic HTML elements (`<button>`, `<a>`, `<input>`, `<textarea>`).
2. **Visible Focus State**: Default browser outlines are disabled. A highly visible focus ring is enforced on every interactive element:
   ```css
   a:focus-visible,
   button:focus-visible,
   input:focus-visible,
   textarea:focus-visible,
   select:focus-visible,
   .drop-zone:focus-visible {
     outline: 2px solid transparent !important;
     box-shadow: 0 0 0 3px var(--accent-primary) !important;
     outline-offset: 2px;
   }
   ```
3. **Interactive Components**: Elements acting as buttons but not using semantic tags (like custom file upload drop-zones) must include `tabindex="0"` and `role="button"`. They must listen to keydown events for `Enter` and `Space` to execute their respective click handlers.
4. **Skip to Content Link**: A high-priority skip link must be the very first tab-accessible element inside the `<body>` on every page:
   ```html
   <a class="skip-link" href="#main-content">Skip to content</a>
   ```

### C. Screen Reader Integration & ARIA Architecture
Non-visual interfaces rely on semantic structures to read the application layout correctly.
1. **ARIA Roles**: Explicitly define layout areas using landmark tags: `<main id="main-content">`, `<header>`, `<nav>`, and `<footer>`.
2. **Accessible Labels**:
   - Every input, select, and textarea must have an associated `<label>` specifying a matching `for` attribute.
   - For components without adjacent labels (like search bars, close buttons, or toggle controls), use `aria-label` or `aria-labelledby`.
3. **Alt Text**: All static graphics must contain descriptive `alt` tags. Decorative SVG icons must include `aria-hidden="true"` to prevent screen readers from reading raw XML paths.
4. **Live Regions (`aria-live`)**: Instant output blocks must programmatically signal status updates to screen readers using `aria-live="polite"`.

---

## 3. UI Component Specifications for Specific Environments

### A. Games Visual Environment
- **Canvas Scaling**: Interactive game grids (arcade, puzzles, boards) must render inside centered card panels. Visual sizing must adapt dynamically without overflowing viewports.
- **Controls Info**: Display clear keyboard layout maps (e.g. arrow keys, WASD) in high-contrast text (`--text-secondary`) situated next to the canvas viewport.

### B. Software & Code Editors Interface
- **Split Layouts**: Visual tools (like editors, diagram generators, and painting canvases) must use flex-grow split layouts to divide active code grids/control inputs from visual previews.
- **Focus Locking**: When modals or full-screen panels are active within the local tool canvas, focus must lock inside the container until closed.

### C. Tutorials & Educational Layouts
- **Reading Comfort**: Text columns must limit line widths to `70ch` to maximize readability. Line height is set to `1.7` (`--font-sans`).
- **Markdown Headers**: Heading layers (`h1` through `h4`) must maintain clear sizing contrast hierarchy.
- **Code Block Formatting**: Markdown code blocks must render in monospace font families with distinct background outlines (`--border-subtle`) and padding constraints.

### D. E-Commerce & Donation Integrations
- **Buy Me a Coffee & Patreon Cards**: Placed in cards utilizing the `--bg-card` glassmorphism layer. Icons and brand-specific callouts must have background overlays adjusted to maintain the `4.5:1` text contrast limit.
- **Stripe & Razorpay Embedded Elements**: Card number fields are enclosed in secure frames matching the dark theme's primary input layouts.
- **Gumroad Store Widget Overlay**: Gumroad products are rendered as a custom responsive grid. Overlays must apply a darkened background screen `rgba(0,0,0,0.6)` to focus user attention, and return active keyboard focus back to the parent product card upon closing.

---

## 4. Multisite & Subdomain Branding Coherence
To support supplementary subdomains (e.g., `blog.bluetext.in` or specific documentation pages):
- **Universal Header**: The navigation header must maintain a unified structure across subdomains, allowing users to jump back to `bluetext.in` dashboard via a persistent logo link.
- **Color Systems**: Subdomains must use the identical custom property variables (`themes.css`) to ensure consistent visual aesthetics across the entire network.

---

## 5. Agent-Assisted Design Development (Spec Kit & Graphify)
To preserve design tokens and layout consistency across all 1,000+ utilities:
- **Spec Validation**: Design modifications must be validated using Spec Kit checks (`/speckit.checklist`) to verify color contrast and screen-reader accessibility rules.
- **Visual Mapping**: The page layouts and card CSS grid assets are registered within the `graphify` knowledge graph rules to prevent visual layout drifts during automated code generation.

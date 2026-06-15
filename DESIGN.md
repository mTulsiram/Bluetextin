---
brand: BlueTEXT
name: BlueTEXT Design System
author: Antigravity Agent
colors:
  light:
    primary-blue: "#0056d2"
    brand-yellow: "#ffd600"
    accent-primary: "#0056d2"
    accent-soft: "rgba(0, 86, 210, 0.12)"
    text-primary: "#1a1a1a"
    text-secondary: "#555555"
    bg-main: "#f4f7f9"
    bg-card: "#ffffff"
    border-color: "#dee2e6"
    stroke: "#d6e3ff"
  dark:
    accent-primary: "#ffb1ee"      /* Neon pink */
    accent-secondary: "#00f0ff"    /* Neon cyan */
    accent-soft: "rgba(255, 177, 238, 0.15)"
    text-primary: "#ededed"
    text-secondary: "#878787"
    bg-main: "#000000"             /* Pure black canvas */
    bg-card: "#0a0a0a"             /* Deep slate/black card */
    border-color: "#2e2e2e"
    stroke: "#2e2e2e"
typography:
  font-main: "Inter, Heebo, Segoe UI, sans-serif"
  font-heading: "Inter, Heebo, Segoe UI, sans-serif"
radius:
  lg: "16px"
  md: "12px"
  sm: "8px"
effects:
  shadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
  shadow-hover: "0 8px 30px rgba(236, 72, 153, 0.2)"
  focus-ring: "0 0 0 3px rgba(236, 72, 153, 0.45)"
  transition: "0.2s ease"
---

# BlueTEXT Design System (`DESIGN.md`)

This design system defines the visual contract for the BlueTEXT web tools platform, ensuring design consistency across all pages and interactive components.

---

## 1. Visual Philosophy
- **Aesthetic**: Rich, premium, and glassmorphic elements. Soft gradients with high-contrast, readable typography.
- **Theme Awareness**: Standard support for Light/Dark themes using CSS Custom Variables.
- **Immersive Spreadsheet Design**: When working with spreadsheet previews or developer layouts, the workspace expands to utilize 96% width of the screen, creating an immersive, desktop-like Excel environment.

---

## 2. Layout & Width Boundaries

### Full-Width Seamless View
For desktop-centric data tools (like the PDF Converter), headers, footers, and page content wrappers (`.doc-page`) stretch to 100% viewport width without card borders or outer margins. This makes the interface fit the screen seamlessly, mimicking `getdesign.md`.

```css
.doc-page {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 24px !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
}
```

### Strict Horizontal Scrollbar Containment
> [!IMPORTANT]
> To prevent large tables or wide data sections from overflowing outside the `.doc-page` container and causing page-level scrollbars:
> 1. Set the outer container wrapper's width and max-width to `100%`.
> 2. Force scroll overflow containment using `overflow-x: auto` on the wrap container itself, not the page body.

```css
.preview-wrap {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto !important;
  overflow-y: auto !important;
}
```

### Theme-Aware Native Controls
> [!NOTE]
> Native dropdowns (`select`) and inputs inside dark mode containers must use the `color-scheme` property to prevent OS-level option contrast issues:
> ```css
> select { color-scheme: light; }
> [data-theme="dark"] select { color-scheme: dark; }
> ```

---

## 3. Component Specifications

### Spreadsheet Table Grid
- **Border Grids**: Border lines around all cells mimic a native desktop spreadsheet.
- **Resizing Drag Handles**: Absolute-positioned handles on header boundaries allow column drag resizing.
- **Selection Highlights**: Selected columns use the accent soft background with a dashed primary border.
- **Inline Editing**: Double-clicking cells or headers swaps text for borderless inputs.

### Spreadsheet Toolbar
- Sits perfectly stacked on top of the preview container.
- Uses `--radius-sm` for top-left and top-right corners, matching the bottom corners of the container.
- Contains buttons for formatting actions (Bold, Align Left/Center/Right, Rename).

---

## 4. Design Do's & Don'ts for AI Agents

### Do
- Always use the HSL/RGB customized CSS variables for colors (avoid plain red/green/blue).
- Set `max-width: 100%` and `overflow-x: auto` on any container containing dynamically sized tables or grids.
- Ensure all interactive tables support keyboard Escape and Enter keys for cell/header edit commits.

### Don't
- Never allow a child table to determine the width of parent container cards.
- Never write hardcoded pixel values for theme colors. Use the aliases (`--surface`, `--stroke`, `--text-soft`).
- Do not let the viewport scroll horizontally on desktop. Keep all overflows self-contained in scrollable divs.

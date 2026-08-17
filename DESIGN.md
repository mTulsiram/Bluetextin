# DESIGN.md — BlueTEXT.in Design System

> This file is read by every `/impeccable` command. It is the single source of truth for all design decisions.
> **Brand**: BlueTEXT.in — always write it this way. Never "Bluetextin" or "Bluetext".

---

## Surface Classification

- **Editor tool**: Product UI (dark, dense, functional — like iMovie × CapCut)
- **Marketing site**: Brand surface (lighter, friendly, conversion-focused)

---

## Color Palette

### Editor (dark theme — primary)

```css
:root {
  /* Backgrounds — layered dark */
  --bg0: #0a0d14;      /* Deepest: canvas backdrop */
  --bg1: #111722;      /* Panels: media bin, inspector */
  --bg2: #162030;      /* Cards, inputs, secondary surfaces */
  --bg3: #1e2b40;      /* Hover states, tooltips */
  --bg4: #283953;      /* Active/pressed states */

  /* Borders */
  --border:        #26364d;   /* Default border */
  --border-bright: #395073;   /* Focus/active border */

  /* Text */
  --text:  #ebf2ff;   /* Primary: high legibility on dark */
  --text2: #9cb1d1;   /* Secondary: labels, descriptions */
  --text3: #6b82a7;   /* Tertiary: placeholders, disabled */

  /* Brand accents (Blue + Yellow Identity) */
  --brand-blue:   #3ea1ff;             /* Electric Blue */
  --brand-yellow: #facc15;             /* Vibrant Energetic Yellow */
  --accent:       #3ea1ff;             /* Primary: Electric Blue */
  --accent-glow:  rgba(62,161,255,.25);/* Shadow glow for accent elements */
  --accent2:      #facc15;             /* Secondary: Vibrant Yellow */
  --accent-yellow:#facc15;

  /* Status */
  --danger:  #ff526a;   /* Delete, error, destructive */
  --success: #2ed573;   /* Confirmation, done states */
  --warning: #ffa502;   /* Caution, unsaved state */
  --purple:  #9b51e0;   /* Effects, AI-generated content (use sparingly) */
}
```

### Marketing site (light variant)

```css
/* Light overrides */
--bg0:    #f7f8fc;
--bg1:    #ffffff;
--bg2:    #f0f2f8;
--text:   #0d1117;
--text2:  #4a5568;
--border: #e2e8f0;
/* Accents remain the same */
```

### Contrast ratios (WCAG AA)
| Pair | Ratio | Pass? |
|------|-------|-------|
| `--text` on `--bg1` | 12.4:1 | ✅ AAA |
| `--text2` on `--bg1` | 5.8:1 | ✅ AA |
| `--text3` on `--bg1` | 3.1:1 | ✅ AA (large text) |
| `--accent` on `--bg0` | 6.2:1 | ✅ AA |
| `--danger` on `--bg1` | 4.8:1 | ✅ AA |

---

## Typography

### Type scale

```css
/* No Inter. Use system-ui with optimized settings for dark backgrounds. */
font-family: 'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif;

/* Scale */
--type-xs:   10px;   /* Track labels, timestamps */
--type-sm:   11px;   /* Panel labels, tooltips, secondary UI */
--type-base: 12px;   /* Default UI text */
--type-md:   13px;   /* Inspector headings, bin category names */
--type-lg:   15px;   /* Section headings */
--type-xl:   18px;   /* Page headings (marketing) */
--type-2xl:  24px;   /* Hero text (marketing) */
--type-3xl:  36px;   /* Marketing headline */

/* Weight */
--weight-regular: 400;
--weight-medium:  500;
--weight-semibold: 600;
--weight-bold:    700;

/* Line height */
--leading-tight:  1.25;   /* Compact UI labels */
--leading-normal: 1.5;    /* Body text, descriptions */
--leading-loose:  1.75;   /* Marketing copy */

/* Letter spacing */
--tracking-tight:  -0.01em;  /* Headlines */
--tracking-normal:  0em;
--tracking-wide:    0.04em;  /* ALL CAPS labels */
```

### Type usage rules
- **Never use system fonts at 400 weight for headings.** Use 600+ for any heading.
- **ALL CAPS text** must use `letter-spacing: 0.08em` minimum.
- **Code/timecode text** uses `font-family: 'Cascadia Code', 'Fira Code', monospace` at `--type-sm`.
- **No font-size below 10px** anywhere, ever.

---

## Spacing & Layout

```css
/* Base unit: 4px */
--space-1:  4px;
--space-2:  8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;

/* Border radius */
--r-sm: 4px;   /* Buttons, inputs, small chips */
--r:    6px;   /* Default cards, panels */
--r-lg: 8px;   /* Modals, large panels */
--r-xl: 12px;  /* Feature cards (marketing) */
--r-full: 9999px;  /* Pills, avatars */

/* Editor-specific layout */
--nav-h:    38px;    /* Top nav height */
--left-w:   28%;     /* Media bin width */
--right-w:  30%;     /* Inspector width */
--tl-h:     260px;   /* Timeline height */
--label-w:  116px;   /* Timeline track label width */
--track-h:  48px;    /* Per-track row height */
--ruler-h:  26px;    /* Time ruler height */
```

---

## Motion & Animation

### Timing

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Default: snappy settle */
--ease-in:  cubic-bezier(0.4, 0, 1, 1);          /* Exit animations */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Gentle spring — NOT bouncy */

/* Duration */
--duration-fast:   80ms;   /* Hover color/opacity shifts */
--duration-normal: 150ms;  /* State changes, panel transitions */
--duration-slow:   250ms;  /* Modal enter/exit */
--duration-slower: 400ms;  /* Page transitions */
```

### Rules
- **Never** use `bounce` or `elastic` easing.
- **Always** respect `prefers-reduced-motion: reduce` — cut all transitions to `0ms`.
- Tab switches: `opacity 0.1s ease-out` only. No slide animations.
- Clip drag on timeline: `transform` only (GPU-composited, no layout triggers).
- Hover states: `--duration-fast` maximum.

---

## Component Tokens

### Buttons

```css
/* Primary (accent) */
.btn-primary {
  background: var(--accent);
  color: #04140c;                /* Dark text on bright accent */
  border-radius: var(--r-sm);
  padding: 5px 14px;
  font-size: var(--type-sm);
  font-weight: var(--weight-bold);
  box-shadow: 0 2px 10px rgba(32,213,155,.3);
  transition: all var(--duration-normal);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(32,213,155,.45);
  filter: brightness(1.08);
}

/* Secondary (ghost) */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text2);
}
.btn-ghost:hover {
  border-color: var(--border-bright);
  color: var(--text);
  background: var(--bg3);
}

/* Destructive */
.btn-danger {
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
}
```

### Inputs & Form Controls

```css
input, select, textarea {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--text);
  font-size: var(--type-sm);
  transition: border-color var(--duration-normal);
}
input:focus, select:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-glow);
}
```

### Panels

```css
.panel {
  background: linear-gradient(180deg, #121824 0%, #0d131d 100%);
  border-right: 1px solid var(--border);
}
/* Never use a flat single-color panel. Always use a subtle gradient for depth. */
```

---

## Icon System

- **All icons are inline SVG only.** No icon fonts. No external sprite sheets.
- Default size: `16×16`. Timeline controls: `20×20`. Nav: `18×18`.
- Icon color inherits from `currentColor` — never hardcoded fill.
- Active/hover states change parent color via CSS cascade.

---

## Interaction Patterns

### Drag & Drop
- Drag source: cursor changes to `grab` → `grabbing`
- Valid drop target: `outline: 2px dashed var(--accent)` with slight background tint
- Invalid drop target: no visual change (fail silently)
- On successful drop: brief `--accent` flash on the dropped clip (0.3s opacity pulse)

### Selection
- Selected clips/items: `outline: 2px solid var(--accent)` + `box-shadow: 0 0 0 1px var(--accent-glow)`
- Multi-select: same outline but `--accent2` (blue)

### Empty States
Every empty state must have:
1. A clear, specific message (what's missing)
2. One primary action (what to do next)
3. Optional: a subtle illustration (inline SVG, not an image)

❌ Don't: "No items found."  
✅ Do: "Your media bin is empty. Import a video to get started." + [Import Media] button

### Loading States
- Spinner: CSS-animated border (never a GIF)
- Skeleton: `var(--bg3)` placeholder blocks with `opacity: 0.4` pulse animation
- Progress bars: `--accent` fill on `--bg3` track

---

## Accessibility Standards (WCAG AA)

- All interactive elements: minimum `44×44px` tap target
- Focus rings: `outline: 2px solid var(--accent)`, `outline-offset: 2px` — never removed
- `aria-label` on all icon-only buttons
- `role="status"` on all async feedback messages
- Timeline clips: keyboard navigable (Tab to select, Arrow keys to nudge, Delete to remove)
- Color is never the only indicator of state (always pair with text or shape)

---

## Anti-Patterns (Banned)

| Pattern | Why banned | Fix |
|---------|-----------|-----|
| `font-family: 'Inter'` as the only font | AI tell, overused | Use system-ui stack |
| Gray `#888` text on dark backgrounds | Often fails contrast | Use `--text3` (#6b82a7) and verify |
| Cards nested 3+ levels deep | Cognitive overload | Flatten to 2 levels max |
| Rounded-square icon + heading in every section | AI template tell | Use inline icons or none |
| Bounce/elastic CSS easing | Feels dated and toy-like | Use `ease-out` or `--ease-spring` |
| `color: purple` on dark bg | Cliché, illegible | Use `--accent` or `--accent2` |
| Gradient text keywords | Overused 2023 trend | Plain text with weight contrast |
| Grid/particle background | Visual noise | Solid/gradient bg only |
| Modal blocking full editor on first launch | Kills trust | Use inline empty states instead |
| Generic CTA: "Get Started" | Means nothing | Be specific: "Import your first video" |

---

## Next recommended commands

- `/impeccable audit` — run a full technical quality check on the video editor
- `/impeccable critique` — UX design review: hierarchy and clarity
- `/impeccable polish` — final design-system alignment pass
- `/impeccable animate` — audit and improve all motion in the editor

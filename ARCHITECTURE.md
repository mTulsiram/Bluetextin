# Bluetextin Video Editor — Architecture & Implementation Map

> **Purpose**: Use this file instead of reading source code. Find any component, its UI location, its CSS class, its JS function, and how to change it — without touching unrelated code.
>
> **Source file**: [`video-canvas-engineering-studio.html`](file:///C:/bluetextin/services/website/Bluetextin/Bluetextin/pages/tools/videos/video-canvas-engineering-studio.html) (single-file monolith, ~6,781 lines)
>
> **Rule**: All CSS in `<style>`, all JS in `<script>`, all icons as inline SVG. No external links.

---

## 1. App Shell Layout

```
┌─────────────────────────────────────────────────────────────┐
│ #nav  (38px)  — Top navigation bar                         │
├──────────┬────────────────────┬────────────────────────────┤
│          │                    │                            │
│ #media-  │  #preview          │  #inspector                │
│ bin      │  (canvas preview)  │  (property editor)         │
│ (28%)    │  (flex 1)          │  (30%)                     │
│          │                    │                            │
├──────────┴────────────────────┴────────────────────────────┤
│ #timeline  (260px) — multi-track editing                   │
└─────────────────────────────────────────────────────────────┘
```

### CSS Variables (`:root`)
| Variable | Value | Purpose |
|----------|-------|---------|
| `--bg0` | `#0a0d14` | Deepest background |
| `--bg1` | `#111722` | Panel background |
| `--bg2` | `#162030` | Input/card background |
| `--bg3` | `#1e2b40` | Hover/subtle element |
| `--border` | `#26364d` | Default border |
| `--accent` | `#20d59b` | Primary brand green |
| `--accent2` | `#3ea1ff` | Secondary blue |
| `--danger` | `#ff526a` | Delete/error |
| `--left-w` | `28%` | Left panel width |
| `--right-w` | `30%` | Right panel width |
| `--tl-h` | `260px` | Timeline height |
| `--track-h` | `48px` | Per-track row height |

---

## 2. Navigation Bar (`#nav`)

**HTML element**: `#nav`  
**CSS class**: `#nav` (height: `--nav-h` = 38px)  
**Location**: Line ~62–78

| Element ID | Type | Purpose |
|-----------|------|---------|
| `#proj-name` | `<input>` | Editable project name |
| `#save-status` | `<span>` | "Saved" / "Unsaved" indicator |
| `#render-quality` | `<select>` | Export quality (720p/1080p/4K) |
| `#render-target` | `<select>` | Export format (MP4/WebM/GIF) |
| `#bg-export` | `<input type="checkbox">` | Background export mode |
| `#btn-render` | `<button>` | Triggers render pipeline |

**To change**: Modify lines ~62–78 in the CSS block and the corresponding HTML near `<nav id="nav">`.

---

## 3. Left Panel — Media Bin (`#media-bin`)

**HTML element**: `#media-bin`  
**CSS class**: `.panel`

### 3a. Category Tab Bar

**CSS class**: `.media-category-tabs`  
**Style**: Icon on top, text below, 48px tall, no horizontal scroll

| Tab ID | Category | Default Active |
|--------|----------|---------------|
| `tab-media` | Media (video + stock) | ✅ YES |
| `tab-audio` | Audio | |
| `tab-titles` | Titles | |
| `tab-transitions` | Transitions | |
| `tab-effects` | Effects | |
| `tab-filters` | Filters | |
| `tab-stickers` | Stickers | |
| `tab-templates` | Templates | |

**JS function to switch categories**:
```js
switchMediaTab(tabName)  // shows the correct .tab-pane
```

### 3b. Category Pane Structure (all 8 bins)

Each category follows this identical 2-column layout:

```html
<div class="tab-pane" id="pane-[category]">
  <!-- Left: category list -->
  <div class="bin-left-nav">
    <div class="bin-search">
      <input type="text" placeholder="Search...">
      <button class="bin-filter-btn">⋯</button>
    </div>
    <ul class="bin-category-list">
      <li class="active">All</li>
      <li>Category A</li>
      <li>Category B</li>
    </ul>
  </div>
  <!-- Right: content grid -->
  <div class="bin-content-area">
    <div class="bin-grid">
      <!-- .bin-item cards, draggable -->
    </div>
  </div>
</div>
```

### 3c. Bin Item (draggable card)

**CSS class**: `.bin-item`  
**Drag source**: `draggable="true"`, data stored in `event.dataTransfer`

```html
<div class="bin-item" draggable="true"
     data-type="video|audio|title|transition|effect|filter|sticker|template"
     data-id="[id]">
  <div class="bin-thumb"><!-- preview image or SVG icon --></div>
  <div class="bin-label">Name</div>
  <div class="bin-duration">0:05</div>
</div>
```

**JS function to populate**: `renderMediaBin()` — rebuilds `#pane-media` from `S.mediaBin[]`

### 3d. Media Import Buttons

| Element | Function |
|---------|---------|
| "Import Media" button | Opens `<input type="file" multiple accept="video/*,audio/*,image/*">` |
| File drag-onto-bin area | `S.panel.ondrop` handler |
| "Clear Cache" button | Clears `S.mediaBin`, `IndexedDB`, re-renders |

---

## 4. Center — Preview Canvas (`#preview`)

**JS function**: `drawFrame()`  
**Called by**: `requestAnimationFrame` loop + `renderTimeline()` completion

```
drawFrame()
  ├── clears canvas (ctx.clearRect)
  ├── iterates S.clips at current S.playhead time
  ├── for each visible clip:
  │    ├── video: ctx.drawImage(videoElement, ...)
  │    ├── image: ctx.drawImage(imgElement, ...)
  │    └── title: ctx.fillText / ctx.strokeText
  └── draws overlay (playhead indicator, safe zone)
```

### Playback Controls

| Element ID | Purpose |
|-----------|---------|
| `#btn-play` | Play/pause toggle, calls `togglePlay()` |
| `#btn-stop` | Stop, resets `S.playhead = 0` |
| `#timecode` | Current time display (HH:MM:SS:FF) |
| `#duration` | Total project duration |
| `#vol-master` | Master volume slider |

---

## 5. Right Panel — Inspector (`#inspector`)

The inspector is **context-sensitive** — it shows different property editors based on `S.selectedClip`.

### Inspector Sub-tabs

```html
<div class="prop-sub-tabs">
  <button class="prop-sub-btn active" data-sub="transform">Transform</button>
  <button class="prop-sub-btn" data-sub="color">Color</button>
  <button class="prop-sub-btn" data-sub="audio">Audio</button>
  <button class="prop-sub-btn" data-sub="effects">Effects</button>
</div>
```

### Clip Type → Inspector Mode

| Clip Type | Shows |
|-----------|-------|
| `video` | Transform (pos, scale, rotation), Color (brightness, contrast), Audio (volume, fade) |
| `audio` | Audio (volume, fade in/out, pan), Waveform preview |
| `title` | Text content editor, Font, Size, Color, BG color |
| `transition` | Duration, Easing |
| `template` | Drop zone list, Replace Asset buttons |

---

## 6. Timeline (`#timeline`)

**Height**: `--tl-h` = 260px (resizable via `.splitter-h`)

### Timeline Structure

```html
<div id="timeline">
  <div id="tl-ruler"><!-- time ruler --></div>
  <div id="tl-tracks">
    <div class="tl-track" data-track-id="0">
      <div class="tl-label">Video 1</div>
      <div class="tl-content">
        <!-- .tl-clip elements dropped here -->
      </div>
    </div>
  </div>
</div>
```

### Clip Element (on timeline)

**CSS class**: `.tl-clip`

```html
<div class="tl-clip" data-clip-id="[uuid]"
     style="left:[start*zoom]px; width:[duration*zoom]px;">
  <div class="tl-clip-label">Clip name</div>
  <div class="tl-clip-trim-l">◀</div>
  <div class="tl-clip-trim-r">▶</div>
</div>
```

### Drag & Drop (OS File Drop onto Timeline)

```js
// Drop flow:
ondrop(e) {
  e.preventDefault();
  // 1. Read files from e.dataTransfer.files
  // 2. For each file, create ObjectURL
  // 3. Call placeMediaOnTrack(file, trackId, dropX)
  // 4. placeMediaOnTrack() creates clip in S.clips[]
  // 5. renderTimeline() redraws all clips
  // 6. drawFrame() updates canvas
}
```

### Timeline JS Functions

| Function | Purpose |
|---------|---------|
| `renderTimeline()` | Full re-render of all tracks and clips |
| `placeMediaOnTrack(asset, trackId, time)` | Creates clip in `S.clips[]`, re-renders |
| `splitClip(clipId, time)` | Splits clip at playhead position |
| `deleteClip(clipId)` | Removes from `S.clips[]`, re-renders |
| `trimClip(clipId, side, newTime)` | Adjusts clip in/out points |
| `moveClip(clipId, newTrack, newStart)` | Moves clip on timeline |
| `addTrack(type)` | Adds new track row to `S.tracks[]` |
| `renderRuler()` | Draws time ruler with current zoom |

---

## 7. Global State Object (`S`)

```js
const S = {
  // Project
  project: { name: 'Untitled', fps: 30, width: 1920, height: 1080 },

  // Assets in bin
  mediaBin: [],       // Array: { id, type, name, url, thumb, duration }

  // Timeline data
  tracks: [],         // Array: { id, type, name, locked, muted }
  clips: [],          // Array: { id, trackId, type, assetId, start, duration, inPoint, outPoint, props }

  // Playback
  playhead: 0,
  playing: false,
  duration: 0,
  zoom: 80,           // px/sec

  // Selection
  selectedClip: null,
  selectedTrack: null,

  // History (undo/redo)
  history: [],
  historyIdx: -1,

  // Media cache
  videoElements: {},  // { assetId: HTMLVideoElement }
  imageElements: {},  // { assetId: HTMLImageElement }

  // Template engine
  templates: [],

  // Plugin registry
  plugins: {},
}
```

**Rule**: After modifying `S.clips` or `S.tracks`, ALWAYS call `renderTimeline()` then `drawFrame()`.

---

## 8. Template System (`BluetextinTemplateEngine`)

### Template Object Format

```js
{
  id: 'social-promo-1',
  name: 'Social Promo',
  category: 'social',
  duration: 15,
  fps: 30,
  resolution: { w: 1080, h: 1920 },
  clips: [
    {
      id: 'clip-bg',
      type: 'video',
      start: 0,
      duration: 15,
      isDropZone: true,         // user replaces with their asset
      dropZoneLabel: 'Background Video',
      props: { x: 0, y: 0, scale: 1 }
    },
    {
      id: 'clip-title',
      type: 'title',
      start: 1,
      duration: 5,
      props: { text: 'YOUR TITLE', fontSize: 72, color: '#fff' }
    }
  ]
}
```

### Template Functions

```js
BluetextinTemplateEngine.apply(templateId)         // Load template into project
BluetextinTemplateEngine.replaceDropZone(clipId, assetId)  // Replace placeholder
BluetextinTemplateEngine.generateFFmpegCommand(clips)      // Build FFmpeg string
```

---

## 9. Plugin / Extension System

### Plugin Registration

```js
window.Bluetextin.registerPlugin({
  id: 'my-effect',
  name: 'My Custom Effect',
  category: 'effects',      // bin tab to appear in
  type: 'effect',
  icon: '<svg>...</svg>',   // inline SVG ONLY
  render(ctx, clip, time) {
    // custom canvas rendering
  },
  inspector: {
    controls: [
      { id: 'intensity', label: 'Intensity', type: 'range', min: 0, max: 1, default: 0.5 }
    ]
  }
})
```

### Plugin Discovery

```js
window.Bluetextin = {
  plugins: {},
  registerPlugin(def) {
    this.plugins[def.id] = def;
    addToBin(def);  // adds to correct bin pane
  }
}
```

---

## 10. Rendering Pipeline

### Preview (real-time)

```
S.playing = true
→ requestAnimationFrame loop
→ drawFrame() each frame
→ canvas draws active clips at S.playhead
→ S.playhead += 1/fps
```

### Export (production)

```
#btn-render click
→ renderToFile()
  → VideoEncoder (WebCodecs API)
  → mp4-muxer Muxer
  → for each frame: drawFrame() → VideoFrame → encoder.encode()
  → muxer.finalize()
  → download .mp4 blob
```

---

## 11. Panels & Splitters

| Element ID | Axis | Controls |
|-----------|------|---------|
| `#splitter-left` | Vertical | Left panel width (`--left-w`) |
| `#splitter-right` | Vertical | Right panel width (`--right-w`) |
| `.splitter-h` | Horizontal | Timeline height (`--tl-h`) |

**Panel Swap**: `.panel-swap-btn` adds `.swapped` class to `#workspace`  
**Panel Pop-out**: `.panel-pop-btn` moves content to `.floating-pop` (position: fixed overlay)

---

## 13. Global Website Architecture & Mega Menu System

### Core Components
* **Master Header**: [`assets/components/header.html`](file:///C:/bluetextin/services/website/Bluetextin/Bluetextin/assets/components/header.html)
  * Multi-column Wondershare-grade Mega Menu with categorized columns (*Video & Creativity*, *Developer & Coding*, *Converters & Office*, *Highlights & Academy*).
  * Hover bridge (`::before`) and 260ms grace period manager in [`assets/js/app.js`](file:///C:/bluetextin/services/website/Bluetextin/Bluetextin/assets/js/app.js) to ensure seamless mouse tracking without menu disappearance.
* **Master Stylesheet**: [`assets/css/main.css`](file:///C:/bluetextin/services/website/Bluetextin/Bluetextin/assets/css/main.css)
  * Unified design tokens (`--bg`, `--surface`, `--accent`, `--border`, `--fg`, `--muted`).
  * Standardized `.tools-grid` and `.tool-card` components.
* **Automated Generator**: [`scripts/build.js`](file:///C:/bluetextin/services/website/Bluetextin/Bluetextin/scripts/build.js)
  * `generateIndexPages()`: Automatically produces standardized card grids for all subdirectories.
  * `injectHeaderFooter()`: Synchronizes header and footer across all 383+ HTML pages.
  * `generateSearchIndex()`: Maintains search database (`assets/data/search-index.json`).
  * `generateTranslationCatalog()`: Generates international catalogs across 19 languages.

---

## 14. Quick Reference — "What to Change" Guide

| What you want to change | What to modify |
|------------------------|---------------|
| Add a new category tab | HTML `.media-category-tabs` + `<div class="tab-pane">` + `switchMediaTab()` |
| Change accent color | CSS `:root` `--accent` |
| Change timeline height | CSS `:root` `--tl-h` |
| Add sample items to a bin | JS: push to default samples array in `renderMediaBin()` or equivalent |
| Fix drag-to-timeline | JS: `.tl-content.ondrop` → `placeMediaOnTrack()` |
| Add inspector property | JS: `updateInspector()` + add `change` event handler |
| Add a new built-in template | JS: push to `S.templates` init array |
| Change canvas resolution | JS: `S.project.width`/`.height`, update canvas element attrs |
| Add an effect | `Bluetextin.registerPlugin({...})` |
| Add keyboard shortcut | JS: `keydown` event listener switch-case |
| Change nav bar buttons | HTML `#nav` element |

---

## 13. File Structure

```
pages/tools/videos/
└── video-canvas-engineering-studio.html   (6,781 lines, ~351KB)
    ├── <head>     SEO meta, mp4-muxer CDN
    ├── <style>    All CSS (~1,500 lines)
    │   ├── :root CSS variables
    │   ├── #app grid layout
    │   ├── #nav styles
    │   ├── .panel, .tab-btn, .media-category-tabs
    │   ├── .bin-item, .bin-grid, .bin-left-nav
    │   ├── #timeline, .tl-track, .tl-clip
    │   ├── #inspector, .prop-sub-tabs
    │   └── .floating-pop, .splitter
    ├── <body>     HTML structure (~1,500 lines)
    │   ├── #app
    │   │   ├── #nav
    │   │   ├── #workspace
    │   │   │   ├── #media-bin (left, 28%)
    │   │   │   ├── #preview (center, flex 1)
    │   │   │   └── #inspector (right, 30%)
    │   │   └── #timeline (bottom, 260px)
    │   └── floating modals / popouts
    └── <script>   All JavaScript (~3,700 lines)
        ├── const S = {...}           ← Global state
        ├── BluetextinTemplateEngine  ← Template class
        ├── window.Bluetextin         ← Plugin registry
        ├── renderMediaBin()          ← Bin population
        ├── renderTimeline()          ← Timeline render
        ├── drawFrame()               ← Canvas render
        ├── placeMediaOnTrack()       ← Drop handling
        ├── updateInspector()         ← Inspector render
        ├── togglePlay() / seekTo()   ← Playback
        ├── renderToFile()            ← Export pipeline
        └── Event listeners (DOMContentLoaded, keydown, drag/drop)
```

---

## 14. Installed Global Skills

These skills are now active at `C:\Users\tulsi\.gemini\config\skills\`:

| Skill | Purpose | Invoke |
|-------|---------|--------|
| `impeccable` | 23 AI design commands, strips UI slop, polish/audit | `/impeccable audit` |
| `no-ai-slop` | Removes AI writing patterns, sharpens copy | `/no-ai-slop [text]` |
| `i-have-adhd` | ADHD-mode: action-first, numbered, no tangents | `/i-have-adhd` |
| `strix-security` | AI pen-testing, security scanning (open-source Strix) | See skill for CLI commands |

---

*Last updated: 2026-08-17 | Source: [video-canvas-engineering-studio.html](file:///C:/bluetextin/services/website/Bluetextin/Bluetextin/pages/tools/videos/video-canvas-engineering-studio.html)*

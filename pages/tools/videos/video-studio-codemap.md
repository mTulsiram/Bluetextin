# Video Canvas Engineering Studio — Code Map
> Single-file app: `video-canvas-engineering-studio.html`  
> Last updated: 2025 (auto-maintained — edit this file when you change the HTML)

---

## 1. CSS Custom Properties (`:root`, L11–17)

| Variable       | Value      | Used by                              |
|----------------|------------|--------------------------------------|
| `--bg0`        | `#0b0b0b`  | `body`, `#preview`                   |
| `--bg1`        | `#141414`  | panels, `#nav`, `#timeline`, ruler   |
| `--bg2`        | `#1c1c1c`  | inputs, `.tl-content`, `.m-item`     |
| `--bg3`        | `#242424`  | button hover, `.clip[data-t=…]`      |
| `--bg4`        | `#2e2e2e`  | range track background               |
| `--border`     | `#2a2a2a`  | all 1px borders, ruler ticks         |
| `--text`       | `#d8d8d8`  | default text color                   |
| `--text2`      | `#787878`  | secondary labels, placeholders       |
| `--accent`     | `#4f7ef5`  | playhead, selected, active tabs      |
| `--accent2`    | `#6691ff`  | hover state on accent elements       |
| `--danger`     | `#e05050`  | muted track indicator, cancel hover  |
| `--success`    | `#40c870`  | (reserved, unused currently)         |
| `--r`          | `5px`      | border-radius shorthand              |
| `--nav-h`      | `46px`     | navbar height in `#app` grid row     |
| `--left-w`     | `255px`    | media bin panel width                |
| `--right-w`    | `272px`    | inspector panel width                |
| `--tl-h`       | `252px`    | timeline panel height in `#app` grid |
| `--label-w`    | `108px`    | sticky track label column width      |
| `--track-h`    | `46px`     | height of each track row             |
| `--ruler-h`    | `24px`     | ruler height                         |

---

## 2. HTML DOM Tree (IDs)

```
#app  (grid: nav-h / 1fr / tl-h)
├── #nav
│   ├── .logo
│   ├── #proj-name          (text input)
│   ├── #save-status        (span)
│   └── #btn-render         (button)
│
├── #workspace  (grid: left-w / 1fr / right-w)
│   ├── #media-bin  (.panel)
│   │   ├── .panel-tabs
│   │   │   └── .tab-btn × 4  (data-tab: mb-media/mb-text/mb-fx/mb-audio)
│   │   ├── #mb-media  (.tab-pane.active)
│   │   │   ├── .search-row → #media-search
│   │   │   ├── #upload-btn → #file-input (hidden)
│   │   │   └── #media-grid  (populated by renderMediaBin)
│   │   ├── #mb-text   (.tab-pane)
│   │   ├── #mb-fx     (.tab-pane)
│   │   └── #mb-audio  (.tab-pane)
│   │
│   ├── #preview
│   │   ├── #canvas-container
│   │   │   └── #canvas-wrap
│   │   │       ├── #preview-canvas  (<canvas> 1280×720)
│   │   │       └── #time-overlay   (absolute, top-left)
│   │   └── #playback-bar
│   │       ├── #btn-prev / #btn-play / #btn-next  (.ctl-btn)
│   │       ├── #play-icon  (svg use href toggles i-play↔i-pause)
│   │       ├── #time-display
│   │       ├── #vol-slider  (range 0–1)
│   │       └── #btn-fs
│   │
│   └── #inspector  (.panel)
│       ├── .panel-tabs → .tab-btn × 2 (insp-props / insp-chat)
│       ├── #insp-props  (.tab-pane.active)
│       │   ├── #empty-sel
│       │   └── #clip-props  (hidden when nothing selected)
│       │       ├── #p-x, #p-y         (number inputs)
│       │       ├── #p-scale, #p-scale-v
│       │       ├── #p-rot
│       │       ├── #p-opacity, #p-opacity-v
│       │       └── #clip-info
│       └── #insp-chat  (.tab-pane)
│           ├── #chat-msgs
│           ├── #chat-in
│           └── #chat-send
│
└── #timeline
    ├── #tl-bar
    │   ├── #btn-undo, #btn-redo
    │   ├── #btn-split, #btn-del
    │   ├── #btn-zoom-out, #zoom-label, #btn-zoom-in
    │   └── #tl-ph-time
    └── #tl-scroll  (overflow:auto — scroll both axes)
        ├── #tl-ruler-row  (sticky top:0)
        │   ├── #tl-spacer  (sticky left:0, width=label-w)
        │   └── #tl-ruler   (dynamic width, cursor:pointer)
        │       ├── .rtick × N   (rendered by renderRuler)
        │       └── #ph-head     (playhead caret)
        └── #tl-tracks  (position:relative)
            ├── .tl-track × N  (rendered by renderTrackRows)
            │   ├── .tl-label  (sticky left:0)
            │   │   ├── .tl-label-name
            │   │   ├── .tl-tc[data-action=mute]
            │   │   └── .tl-tc[data-action=lock]
            │   └── .tl-content[data-track-id]  (dynamic width)
            │       └── .clip × N  (rendered by renderClips)
            │           ├── .clip-rl  (left resize handle)
            │           ├── .clip-lbl
            │           ├── .clip-dur
            │           └── .clip-rr  (right resize handle)
            └── #ph-line  (vertical line, absolute)

#exp-overlay  (fixed, z:1000)
└── #exp-box
    ├── #exp-note, #exp-bar → #exp-fill, #exp-lbl, #btn-exp-cancel

#toast  (fixed, z:2000)

#media-pool  (fixed off-screen — holds <video>/<audio> elements)
```

---

## 3. JS Constants (L343–349)

| Constant           | Value                          | Purpose                            |
|--------------------|--------------------------------|------------------------------------|
| `TRACK_ACCEPTS`    | `{video:[…], audio:[…], text:[…]}` | Which media types each track accepts |
| `FRAME_STEP`       | `1/30`                         | Step-frame button delta (30fps)    |
| `MIN_CLIP_DUR`     | `0.1`                          | Minimum clip duration (seconds)    |
| `THUMB_TIMEOUT`    | `3500`                         | Thumbnail generation timeout (ms)  |
| `CANVAS_W/H`       | `1280 / 720`                   | Export canvas resolution           |

---

## 4. State Object `S` (L354–369)

| Field              | Type        | Purpose                             |
|--------------------|-------------|-------------------------------------|
| `S.mediaBin`       | `Array`     | `{id,name,type,url,duration,thumbnailUrl,w,h}` |
| `S.tracks`         | `Array`     | `{id,type,name,muted,locked}` — 4 tracks: v1,v2,a1,t1 |
| `S.clips`          | `Array`     | `{id,trackId,mediaId,startTime,duration,trimIn,x,y,scaleX,scaleY,rotation,opacity}` |
| `S.playheadTime`   | `number`    | Current time in seconds             |
| `S.selectedClipId` | `string\|null` | ID of selected clip              |
| `S.zoomPxPerSec`   | `number`    | Timeline zoom: pixels per second    |
| `S.isPlaying`      | `bool`      | Playback state                      |
| `S.isExporting`    | `bool`      | Export state                        |
| `S.history`        | `{undo[],redo[]}` | JSON-serialized clips arrays   |

---

## 5. JS Functions — Dependency Graph

### Audio Subsystem
```
initAudio()          → creates AudioContext, previewMaster, exportMaster, exportDest
resumeAudio()        → calls audioCtx.resume()
ensureAudioNode(mid, el)
  → calls initAudio()
  → returns {source, previewGain, exportGain}
  → stores in audioNodes Map
syncAudioGains()
  → reads S.clips, S.tracks, S.playheadTime
  → reads audioNodes Map
  → writes previewGain.gain, exportGain.gain
```

### Media Pool
```
createMediaEl(type, url, id)
  → appends <video>/<audio> to #media-pool
  → stores in mediaEls Map
getMediaEl(id)
  → reads mediaEls Map
generateThumbnail(file, id, type, cb)
  → creates off-screen <video>, draws to <canvas>
  → calls cb(dataUrl | null)
addFiles(files)              [async]
  → calls uid(), createMediaEl(), generateThumbnail()
  → mutates S.mediaBin
  → calls renderMediaBin() twice (immediately + after thumb)
```

### History
```
saveHistory()
  → pushes JSON.stringify(S.clips) to S.history.undo
undo()
  → pops S.history.undo → restores S.clips
  → calls renderTimeline(), renderInspector()
redo()
  → pops S.history.redo → restores S.clips
  → calls renderTimeline(), renderInspector()
```

### Utilities
```
uid()            → increments _uid counter, returns "c{N}"
fmtTime(sec)     → "M:SS.ss"   (2 decimal places)
fmtLong(sec)     → "M:SS.sss"  (3 decimal places, used by #time-overlay)
toast(msg)       → shows/hides #toast
ico(id, sz)      → returns SVG <use> HTML string
totalDur()       → max(startTime+duration) across S.clips
tlWidth()        → max(totalDur*zoom+300, 600)  ← NEEDS UPDATE for 4h default
```

### Canvas / Rendering
```
resizeCanvas()
  → reads #canvas-container dimensions
  → writes #canvas-wrap and #preview-canvas style.width/height
drawFrame()
  → reads S.playheadTime, S.tracks, S.clips, S.mediaBin, mediaEls
  → calls ctx2.drawImage() for each active clip
  → writes #time-overlay.textContent
```

### Playback
```
startPlay()
  → sets S.isPlaying=true
  → calls resumeAudio(), syncAndPlay()
  → starts rAF loop via playLoop()
  → sets #play-icon href → i-pause
stopPlay()
  → sets S.isPlaying=false
  → cancels rAF
  → pauses all mediaEls
  → sets #play-icon href → i-play
playLoop()      [rAF]
  → updates S.playheadTime from wall clock
  → calls syncAudioGains(), drawFrame(), updatePHUI()
  → calls stopPlay() when past totalDur()
syncAndPlay()
  → reads S.clips, S.mediaBin, S.playheadTime
  → calls ensureAudioNode() for each clip
  → sets el.currentTime, calls el.play()
seekTo(t)
  → clamps t, writes S.playheadTime
  → calls drawFrame(), updatePHUI()
  → if playing: resyncs _pbWall/_pbTime, calls syncAndPlay()
updatePHUI()
  → reads S.playheadTime, S.zoomPxPerSec
  → writes #ph-head.style.left, #ph-line.style.left
  → writes #time-display.textContent, #tl-ph-time.textContent
```

### Timeline Render
```
renderTimeline()
  → calls renderRuler(), renderTrackRows(), renderClips(), updatePHUI()

renderRuler()
  → reads tlWidth(), S.zoomPxPerSec
  → writes #tl-ruler.style.width
  → creates/removes .rtick elements
  → auto-picks tick interval from [0.1,0.25,0.5,1,2,5,10,30,60]

renderTrackRows()
  → reads S.tracks, tlWidth()
  → removes existing .tl-track elements from #tl-tracks
  → creates .tl-track rows (label + content) per track
  → attaches dragover/dragleave/drop to each .tl-content
  → writes #ph-line.style.height

renderClips()
  → reads S.clips, S.mediaBin, S.zoomPxPerSec, S.selectedClipId
  → removes existing .clip elements
  → creates .clip per clip, positions by startTime*zoom
  → calls attachClipMouse(el, clip)

attachClipMouse(el, clip)
  → on mousedown: determines mode (move/rl/rr)
  → on mousemove: mutates clip.startTime or clip.duration or clip.trimIn
  → calls renderClips(), updatePHUI() during drag
  → calls renderTimeline() on mouseup
```

### Drag & Drop (Media Bin → Timeline)
```
onDragOver(e, track)
  → checks TRACK_ACCEPTS vs _dragMediaType
  → toggles .over / .reject on .tl-content
onDrop(e, track)
  → reads mediaId from dataTransfer
  → validates TRACK_ACCEPTS and track.locked
  → computes startTime from clientX
  → calls saveHistory(), pushes to S.clips, calls renderTimeline()
```

### Inspector
```
renderInspector()
  → reads S.selectedClipId, S.clips, S.mediaBin
  → toggles #empty-sel / #clip-props visibility
  → writes #p-x, #p-y, #p-scale, #p-rot, #p-opacity values
  → writes #p-scale-v, #p-opacity-v display text
  → writes #clip-info.innerHTML
bindInspector()
  → binds input events on #p-x, #p-y, #p-scale, #p-rot, #p-opacity
  → on input: mutates clip[key], calls renderInspector(), drawFrame()
```

### Ruler Seek
```
bindRulerSeek()
  → binds mousedown on #tl-ruler and #ph-head
seekFromMouse(e)
  → reads ruler.getBoundingClientRect(), #tl-scroll.scrollLeft
  → calls seekTo()
```

### Timeline Editing
```
splitClip()
  → requires S.selectedClipId and playhead inside clip
  → calls saveHistory(), splits clip into two, calls renderTimeline()
deleteSelected()
  → removes clip from S.clips, calls renderTimeline(), renderInspector()
```

### Export
```
startExport()
  → checks MediaRecorder support, clip count
  → calls stopPlay(), seekTo(0), initAudio()
  → creates MediaRecorder from canvas.captureStream(30) + exportDest.stream
  → runs rAF loop updating progress bar
  → calls cancelExport(false) when done → triggers finishExport()
cancelExport(user)
  → stops recording, cleans up rAF and mediaEls
finishExport(mime)
  → creates Blob from _expChunks
  → triggers download via <a>.click()
  → calls cleanupExport()
cleanupExport()
  → resets S.isExporting, S.isPlaying, re-enables #btn-render, hides #exp-overlay
```

### Init / Events
```
init()
  → calls bindInspector(), bindRulerSeek(), bindEvents()
  → calls resizeCanvas(), renderTimeline(), drawFrame()
  → writes #zoom-label initial text

bindEvents()
  → #file-input change → addFiles()
  → #upload-btn dragover/drop → addFiles()
  → #media-grid dragstart → sets _dragMediaType
  → #media-search input → renderMediaBin()
  → #btn-play click → startPlay()/stopPlay()
  → #btn-prev/next click → seekTo(±FRAME_STEP)
  → #vol-slider input → previewMaster.gain.value
  → #btn-fs click → canvas-wrap.requestFullscreen()
  → #btn-undo/redo click → undo()/redo()
  → #btn-split click → splitClip()
  → #btn-del click → deleteSelected()
  → #btn-zoom-in/out click → S.zoomPxPerSec ×/÷ 1.4, renderTimeline()
  → #tl-tracks click (delegated) → track mute/lock toggle, renderTimeline()
  → #btn-render click → startExport()
  → #btn-exp-cancel click → cancelExport(true)
  → #chat-send click / #chat-in Enter → sendMsg()
  → document keydown → Space/Delete/Ctrl+Z/Y shortcuts
  → document pointerdown → resumeAudio()
  → ResizeObserver on #canvas-container → resizeCanvas()
```

---

## 6. Event Flow Graph

```
User clicks Play
  └─► bindEvents:#btn-play → startPlay()
        ├─► resumeAudio()
        ├─► syncAndPlay() → ensureAudioNode() per clip
        └─► playLoop() [rAF]
              ├─► syncAudioGains()
              ├─► drawFrame()
              └─► updatePHUI() → #ph-head.left, #ph-line.left, #time-display

User drops media on track
  └─► onDrop() → saveHistory() → S.clips.push() → renderTimeline()
        ├─► renderRuler()     → .rtick DOM
        ├─► renderTrackRows() → .tl-track DOM (re-attaches drag handlers)
        ├─► renderClips()     → .clip DOM + attachClipMouse()
        └─► updatePHUI()      → #ph-head, #ph-line, time displays

User drags clip
  └─► attachClipMouse mousedown
        ├─► mousemove → clip mutation → renderClips() + updatePHUI()
        └─► mouseup   → renderTimeline() (full re-render)

User clicks ruler
  └─► bindRulerSeek → seekFromMouse() → seekTo()
        ├─► drawFrame()
        └─► updatePHUI()

Zoom in/out
  └─► bindEvents:#btn-zoom-in/out → S.zoomPxPerSec mutation → renderTimeline()
        (ruler width, clip positions, ph-head, ph-line all recalculate)
```

---

## 7. Known Issues / Anomalies

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | `tlWidth()` floor is `600` — should be `DEFAULT_TIMELINE_DURATION * S.zoomPxPerSec` for 4h default | L524 | Timeline too narrow at low zoom |
| 2 | `fmtTime` shows `M:SS.ss` not `HH:MM:SS` — ruler ticks show wrong format at hour scale | L495–500, L722 | Ruler shows "239:59" not "3:59:59" |
| 3 | No `DEFAULT_TIMELINE_DURATION` constant — 4h default needs to be explicit | (missing) | Can't tune default duration easily |
| 4 | `.tl-label` uses `position:sticky` but is inside `#tl-tracks` which is a child of `#tl-scroll` — working, but splitting into two panels (left/right) is the clean solution | L123, L321 | Labels can drift on old browsers |
| 5 | `renderTrackRows()` destroys and recreates all DOM on every render — event handlers re-attached but drag state lost mid-drag | L727–750 | Can cause flicker; label resizer needs doc-level pointer events |
| 6 | Zoom only has +/- buttons, no slider — hard to jump to specific zoom level | L1083–1092 | UX friction |
| 7 | `#tl-scroll` uses browser scrollbar — no custom scrollbar currently | L110 | Inconsistent with design system |
| 8 | `S.history` stores full clips array as JSON — no media bin history | L473–476 | Undo doesn't revert accidental media deletes (none yet, but future risk) |
| 9 | `syncAudioGains()` called every rAF frame — O(clips×tracks) per frame | L402–412 | Fine at small clip counts; optimize if > ~200 clips |
| 10 | `#save-status` always shows "Unsaved" — no autosave or localStorage | L213 | User can lose work on refresh |

---

## 8. Pending Features (from session history)

| Feature | Status | Notes |
|---------|--------|-------|
| Split `#tl-tracks` into left labels / right lanes | ❌ Reverted | Add `#tl-tracks-left` (sticky) + `#tl-tracks-right` + `#tl-lanes` |
| Custom horizontal scrollbar (`#tl-hscroll`) | ❌ Reverted | Must be sibling of `#tl-scroll`, not inside it |
| Hide native scrollbar on `#tl-scroll` | ❌ Reverted | `scrollbar-width:none` + `-webkit-scrollbar` override |
| Resizable label column (`#tl-label-resizer`) | ❌ Reverted | Drag handle on right edge of left panel |
| Contrast improvements (CSS vars) | ❌ Reverted | `--text:#f2f2f2`, `--text2:#c0c0c0`, `--border:#4a4a4a` etc. |
| 4-hour default timeline | ❌ Reverted | `DEFAULT_TIMELINE_DURATION=14400`, update `tlWidth()` |
| Ruler format HH:MM:SS | ❌ Reverted | Rewrite `fmtRulerTime()`, use ms only when interval < 1 |
| Zoom slider strip (- [range] +) | ❌ Not started | Replace zoom +/- buttons in `#tl-bar` |
| Remove debug CID numbers from `<body>` | ❌ Reverted | Remove `class="debug-cids"` from `<body>` |

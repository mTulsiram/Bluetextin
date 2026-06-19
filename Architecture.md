# Technical Architecture Specification (Architecture.md)

This document describes the technical architecture and compliance framework for **BlueTEXT.in**. As a local-first, serverless utility suite, the platform offloads execution to the client's browser, providing extreme speed, privacy, and off-grid performance.

---

## 1. Client-Side Runtime & Infrastructure

### A. Folder Architecture Map (Subcategory Structure)
To support a high-quality visual navigation dashboard, the codebase organizes all tools, games, software, and tutorials into five core categories. Each entry is hosted within its own subdirectory containing a dedicated index file:

```
/ (Root)
├── index.html                      # Landing page & core search router
├── DESIGN.md                       # Brand design and accessibility standards
├── Architecture.md                 # Technical architecture spec
├── assets/
│   ├── css/                        # themes.css, base.css, components.css
│   ├── js/                         # app.js, router.js, service-worker.js
│   └── data/                       # tools.json metadata index file
├── components/
│   ├── header.html                 # Global navigation template
│   └── footer.html                 # Global footer containing compliance indicators
```

---

### B. Detailed File & Folder Map

#### 1. Image & Graphic Tools (`/tools/images/`)
- Main Directory: `/tools/images/index.html`
- Individual Pages:
  - `/tools/images/jpeg-compressor.html`
  - `/tools/images/png-to-webp-converter.html`
  - `/tools/images/svg-optimizer.html`
  - `/tools/images/background-remover.html`
  - `/tools/images/image-resizer.html`
  - `/tools/images/photo-cropper.html`
  - `/tools/images/color-picker.html`
  - `/tools/images/palette-generator.html`
  - `/tools/images/watermark-adder.html`
  - `/tools/images/meme-generator.html`
  - `/tools/images/gif-maker.html`
  - `/tools/images/favicon-generator.html`
  - `/tools/images/base64-to-image.html`
  - `/tools/images/exif-data-viewer.html`
  - `/tools/images/image-blurrer.html`
  - `/tools/images/photo-filter-editor.html`
  - `/tools/images/pixel-art-creator.html`
  - `/tools/images/ico-converter.html`
  - `/tools/images/image-splitter.html`
  - `/tools/images/icns-converter.html`
  - `/tools/images/tiff-to-pdf.html`
  - `/tools/images/heic-to-jpg.html`
  - `/tools/images/image-flipper.html`
  - `/tools/images/ascii-art-generator.html`
  - `/tools/images/image-metadata-stripper.html`
  - `/tools/images/qr-code-to-png.html`
  - `/tools/images/canvas-paint-board.html`
  - `/tools/images/svg-to-png.html`
  - `/tools/images/sprite-sheet-generator.html`
  - `/tools/images/normal-map-generator.html`

#### 2. Video & Audio Tools (`/tools/videos/`)
- Main Directory: `/tools/videos/index.html`
- Individual Pages:
  - `/tools/videos/mp4-compressor.html`
  - `/tools/videos/video-to-gif.html`
  - `/tools/videos/audio-extractor.html`
  - `/tools/videos/video-trimmer.html`
  - `/tools/videos/mp3-volume-booster.html`
  - `/tools/videos/audio-cutter.html`
  - `/tools/videos/wav-to-mp3-converter.html`
  - `/tools/videos/video-resizer.html`
  - `/tools/videos/subtitle-merger.html`
  - `/tools/videos/screen-recorder.html`
  - `/tools/videos/voice-recorder.html`
  - `/tools/videos/video-reverse-tool.html`
  - `/tools/videos/audio-joiner.html`
  - `/tools/videos/video-playback-speed-changer.html`
  - `/tools/videos/bpm-counter.html`
  - `/tools/videos/metronome-online.html`
  - `/tools/videos/frequency-generator.html`
  - `/tools/videos/ogg-converter.html`
  - `/tools/videos/flac-to-mp3.html`
  - `/tools/videos/video-mute.html`
  - `/tools/videos/audio-panner.html`
  - `/tools/videos/text-to-speech-mp3.html`
  - `/tools/videos/srt-subtitle-generator.html`
  - `/tools/videos/vtt-to-srt-converter.html`
  - `/tools/videos/midi-visualizer.html`
  - `/tools/videos/pitch-shifter.html`
  - `/tools/videos/video-thumbnail-generator.html`
  - `/tools/videos/audio-spectrum-generator.html`
  - `/tools/videos/noise-gate-simulator.html`
  - `/tools/videos/video-aspect-ratio-calculator.html`

#### 3. Office, Text & Writing Tools (`/tools/office/`)
- Main Directory: `/tools/office/index.html`
- Individual Pages:
  - `/tools/office/word-processor.html`
  - `/tools/office/spreadsheet-editor.html`
  - `/tools/office/presentation-maker.html`
  - `/tools/office/vector-diagram-editor.html`
  - `/tools/office/flowchart-maker.html`
  - `/tools/office/mindmap-generator.html`
  - `/tools/office/pdf-form-filler.html`
  - `/tools/office/word-counter.html`
  - `/tools/office/case-converter.html`
  - `/tools/office/lorem-ipsum-generator.html`
  - `/tools/office/text-diff-checker.html`
  - `/tools/office/find-and-replace.html`
  - `/tools/office/slug-generator.html`
  - `/tools/office/character-counter.html`
  - `/tools/office/binary-to-text.html`
  - `/tools/office/morse-code-translator.html`
  - `/tools/office/markdown-editor.html`
  - `/tools/office/pdf-to-word.html`
  - `/tools/office/word-to-pdf.html`
  - `/tools/office/pdf-merge.html`
  - `/tools/office/pdf-split.html`
  - `/tools/office/pdf-compressor.html`
  - `/tools/office/pdf-password-remover.html`
  - `/tools/office/epub-to-pdf.html`
  - `/tools/office/excel-to-json.html`
  - `/tools/office/csv-to-xml.html`
  - `/tools/office/text-sorter.html`
  - `/tools/office/remove-duplicate-lines.html`
  - `/tools/office/strip-html-tags.html`
  - `/tools/office/upside-down-text.html`
  - `/tools/office/invisible-character-generator.html`
  - `/tools/office/nato-phonetic-alphabet-translator.html`
  - `/tools/office/text-to-handwriting-converter.html`
  - `/tools/office/signature-generator.html`
  - `/tools/office/invoice-generator.html`
  - `/tools/office/resume-builder.html`
  - `/tools/office/fax-cover-sheet-creator.html`

#### 4. Coding & Web Development Tools (`/tools/coding/`)
- Main Directory: `/tools/coding/index.html`
- Individual Pages:
  - `/tools/coding/json-formatter.html`
  - `/tools/coding/html-minifier.html`
  - `/tools/coding/css-beautifier.html`
  - `/tools/coding/javascript-obfuscator.html`
  - `/tools/coding/url-encoder-decoder.html`
  - `/tools/coding/base64-encoder.html`
  - `/tools/coding/md5-hash-generator.html`
  - `/tools/coding/sha256-hash-generator.html`
  - `/tools/coding/regex-tester.html`
  - `/tools/coding/cron-expression-descriptor.html`
  - `/tools/coding/xml-to-json.html`
  - `/tools/coding/jwt-decoder.html`
  - `/tools/coding/uuid-v4-generator.html`
  - `/tools/coding/sql-formatter.html`
  - `/tools/coding/yaml-to-json.html`
  - `/tools/coding/htpasswd-generator.html`
  - `/tools/coding/html-entities-escape.html`
  - `/tools/coding/css-gradient-button-maker.html`
  - `/tools/coding/flexbox-playground.html`
  - `/tools/coding/css-grid-generator.html`
  - `/tools/coding/box-shadow-generator.html`
  - `/tools/coding/rgba-to-hex-converter.html`
  - `/tools/coding/bcrypt-hash-checker.html`
  - `/tools/coding/rsa-key-pair-generator.html`
  - `/tools/coding/hmac-generator.html`
  - `/tools/coding/string-to-hex.html`
  - `/tools/coding/gitignore-generator.html`
  - `/tools/coding/user-agent-parser.html`
  - `/tools/coding/markdown-to-html.html`
  - `/tools/coding/json-schema-validator.html`

#### 5. Mathematics & Finance Calculators (`/tools/math/`)
- Main Directory: `/tools/math/index.html`
- Individual Pages:
  - `/tools/math/percentage-calculator.html`
  - `/tools/math/scientific-calculator.html`
  - `/tools/math/loan-emi-calculator.html`
  - `/tools/math/compound-interest-calculator.html`
  - `/tools/math/mortgage-calculator.html`
  - `/tools/math/gpa-calculator.html`
  - `/tools/math/binary-calculator.html`
  - `/tools/math/matrix-multiplication-calculator.html`
  - `/tools/math/fraction-to-decimal.html`
  - `/tools/math/prime-number-checker.html`
  - `/tools/math/gcd-lcm-calculator.html`
  - `/tools/math/quadratic-equation-solver.html`
  - `/tools/math/statistics-mean-median-mode.html`
  - `/tools/math/random-number-generator.html`
  - `/tools/math/currency-converter.html`
  - `/tools/math/crypto-profit-calculator.html`
  - `/tools/math/sales-tax-vat-calculator.html`
  - `/tools/math/discount-calculator.html`
  - `/tools/math/salary-paycheck-calculator.html`
  - `/tools/math/roi-calculator.html`
  - `/tools/math/inflation-calculator.html`
  - `/tools/math/tip-calculator.html`
  - `/tools/math/depreciation-calculator.html`
  - `/tools/math/car-lease-calculator.html`
  - `/tools/math/retirement-planner.html`
  - `/tools/math/stock-average-calculator.html`
  - `/tools/math/margin-markup-calculator.html`
  - `/tools/math/probability-calculator.html`
  - `/tools/math/standard-deviation-calculator.html`
  - `/tools/math/factorial-calculator.html`

#### 6. Measurement & Unit Converters (`/tools/converters/`)
- Main Directory: `/tools/converters/index.html`
- Individual Pages:
  - `/tools/converters/length-converter.html`
  - `/tools/converters/weight-mass-converter.html`
  - `/tools/converters/temperature-converter.html`
  - `/tools/converters/area-converter.html`
  - `/tools/converters/volume-converter.html`
  - `/tools/converters/speed-converter.html`
  - `/tools/converters/time-zone-converter.html`
  - `/tools/converters/data-storage-converter.html`
  - `/tools/converters/energy-converter.html`
  - `/tools/converters/power-converter.html`
  - `/tools/converters/pressure-converter.html`
  - `/tools/converters/angle-converter.html`
  - `/tools/converters/torque-converter.html`
  - `/tools/converters/fuel-consumption-converter.html`
  - `/tools/converters/shoe-size-converter.html`
  - `/tools/converters/clothing-size-converter.html`
  - `/tools/converters/roman-numerals-converter.html`
  - `/tools/converters/number-to-words-converter.html`
  - `/tools/converters/braille-translator.html`
  - `/tools/converters/morse-to-text.html`
  - `/tools/converters/unix-timestamp-converter.html`
  - `/tools/converters/bytes-to-human-readable.html`
  - `/tools/converters/hz-to-ms-converter.html`
  - `/tools/converters/density-calculator.html`
  - `/tools/converters/force-converter.html`
  - `/tools/converters/flow-rate-converter.html`
  - `/tools/converters/radiation-converter.html`
  - `/tools/converters/voltage-to-watts.html`
  - `/tools/converters/cooking-measurement-converter.html`
  - `/tools/converters/gmt-to-local-time.html`

#### 7. Network & SEO Tools (`/tools/network/`)
- Main Directory: `/tools/network/index.html`
- Individual Pages:
  - `/tools/network/ip-address-lookup.html`
  - `/tools/network/dns-records-checker.html`
  - `/tools/network/whois-domain-lookup.html`
  - `/tools/network/ping-test.html`
  - `/tools/network/port-scanner.html`
  - `/tools/network/mac-address-lookup.html`
  - `/tools/network/subnet-calculator.html`
  - `/tools/network/http-headers-viewer.html`
  - `/tools/network/ssl-certificate-checker.html`
  - `/tools/network/meta-tags-generator.html`
  - `/tools/network/sitemap-generator.html`
  - `/tools/network/robots-txt-generator.html`
  - `/tools/network/broken-links-checker.html`
  - `/tools/network/redirect-checker.html`
  - `/tools/network/open-graph-generator.html`
  - `/tools/network/serp-preview-tool.html`
  - `/tools/network/domain-age-calculator.html`
  - `/tools/network/page-speed-insights-shortcut.html`
  - `/tools/network/keyword-density-checker.html`
  - `/tools/network/htaccess-redirect-generator.html`
  - `/tools/network/ip-subnet-mask-converter.html`
  - `/tools/network/proxy-checker.html`
  - `/tools/network/website-hosting-checker.html`
  - `/tools/network/blacklist-lookup.html`
  - `/tools/network/email-header-analyzer.html`
  - `/tools/network/dkim-record-checker.html`
  - `/tools/network/spf-record-generator.html`
  - `/tools/network/txt-record-lookup.html`
  - `/tools/network/dmarc-generator.html`
  - `/tools/network/link-price-calculator.html`

#### 8. Health, Fitness & Lifestyle Tools (`/tools/lifestyle/`)
- Main Directory: `/tools/lifestyle/index.html`
- Individual Pages:
  - `/tools/lifestyle/bmi-calculator.html`
  - `/tools/lifestyle/bmr-calculator.html`
  - `/tools/lifestyle/body-fat-percentage-calculator.html`
  - `/tools/lifestyle/calorie-intake-calculator.html`
  - `/tools/lifestyle/water-intake-tracker.html`
  - `/tools/lifestyle/macro-nutrients-calculator.html`
  - `/tools/lifestyle/target-heart-rate-calculator.html`
  - `/tools/lifestyle/pregnancy-due-date-calculator.html`
  - `/tools/lifestyle/ovulation-calendar.html`
  - `/tools/lifestyle/period-tracker.html`
  - `/tools/lifestyle/ideal-weight-calculator.html`
  - `/tools/lifestyle/blood-alcohol-concentration-calculator.html`
  - `/tools/lifestyle/smoking-cost-calculator.html`
  - `/tools/lifestyle/sleep-cycle-calculator.html`
  - `/tools/lifestyle/age-calculator.html`
  - `/tools/lifestyle/days-until-counter.html`
  - `/tools/lifestyle/chronological-age-calculator.html`
  - `/tools/lifestyle/biorhythm-calculator.html`
  - `/tools/lifestyle/birthstone-finder.html`
  - `/tools/lifestyle/zodiac-sign-finder.html`
  - `/tools/lifestyle/love-compatibility-calculator.html`
  - `/tools/lifestyle/habit-tracker-board.html`
  - `/tools/lifestyle/digital-poker-chips-counter.html`
  - `/tools/lifestyle/workout-interval-timer.html`
  - `/tools/lifestyle/step-to-distance-converter.html`
  - `/tools/lifestyle/caffeine-metabolism-calculator.html`
  - `/tools/lifestyle/hydration-reminder.html`
  - `/tools/lifestyle/one-rep-max-calculator.html`
  - `/tools/lifestyle/body-surface-area-calculator.html`
  - `/tools/lifestyle/military-time-converter.html`

#### 9. Randomizers & Everyday Utilities (`/tools/utilities/`)
- Main Directory: `/tools/utilities/index.html`
- Individual Pages:
  - `/tools/utilities/password-generator.html`
  - `/tools/utilities/qr-code-generator.html`
  - `/tools/utilities/barcode-generator.html`
  - `/tools/utilities/random-name-picker.html`
  - `/tools/utilities/coin-flipper.html`
  - `/tools/utilities/dice-roller.html`
  - `/tools/utilities/wheel-decider.html`
  - `/tools/utilities/stopwatch.html`
  - `/tools/utilities/countdown-timer.html`
  - `/tools/utilities/alarm-clock.html`
  - `/tools/utilities/color-blindness-simulator.html`
  - `/tools/utilities/screen-color-test.html`
  - `/tools/utilities/anagram-solver.html`
  - `/tools/utilities/scrabble-word-finder.html`
  - `/tools/utilities/crossword-clue-solver.html`
  - `/tools/utilities/palette-extractor.html`
  - `/tools/utilities/credit-card-validator.html`
  - `/tools/utilities/iban-validator.html`
  - `/tools/utilities/crypto-address-validator.html`
  - `/tools/utilities/sound-level-meter-mock.html`
  - `/tools/utilities/bubble-level-online.html`
  - `/tools/utilities/ruler-on-screen.html`
  - `/tools/utilities/protractor-on-screen.html`
  - `/tools/utilities/virtual-piano.html`
  - `/tools/utilities/morse-code-flasher.html`
  - `/tools/utilities/sales-pitch-generator.html`
  - `/tools/utilities/username-generator.html`
  - `/tools/utilities/lottery-number-picker.html`
  - `/tools/utilities/list-randomizer.html`
  - `/tools/utilities/card-shuffler.html`

#### 10. Data, Formats & Database Tools (`/tools/data/`)
- Main Directory: `/tools/data/index.html`
- Individual Pages:
  - `/tools/data/csv-to-json-converter.html`
  - `/tools/data/json-to-csv-converter.html`
  - `/tools/data/xml-to-yaml-converter.html`
  - `/tools/data/yaml-to-xml-converter.html`
  - `/tools/data/sql-query-builder.html`
  - `/tools/data/regex-extractor.html`
  - `/tools/data/data-anonymizer.html`
  - `/tools/data/tsv-to-json.html`
  - `/tools/data/json-minify.html`
  - `/tools/data/base32-encoder-decoder.html`
  - `/tools/data/url-parameter-parser.html`
  - `/tools/data/query-string-generator.html`
  - `/tools/data/hex-dump-viewer.html`
  - `/tools/data/binary-to-hex.html`
  - `/tools/data/hex-to-binary.html`
  - `/tools/data/ascii-to-binary.html`
  - `/tools/data/binary-to-ascii.html`
  - `/tools/data/serialized-php-parser.html`
  - `/tools/data/protobuf-decoder.html`
  - `/tools/data/bson-to-json.html`
  - `/tools/data/excel-to-markdown.html`
  - `/tools/data/html-table-generator.html`
  - `/tools/data/latex-equation-editor.html`
  - `/tools/data/json-tree-viewer.html`
  - `/tools/data/ini-to-json-converter.html`
  - `/tools/data/toml-to-json.html`
  - `/tools/data/json-to-toml.html`
  - `/tools/data/data-sorting-matrix.html`
  - `/tools/data/column-to-comma-separator.html`
  - `/tools/data/text-to-sql-insert-generator.html`

#### 11. Miscellaneous & Creative Utilities (`/tools/miscellaneous/`)
- Main Directory: `/tools/miscellaneous/index.html`
- Individual Pages:
  - `/tools/miscellaneous/collaborative-whiteboard.html`
  - `/tools/miscellaneous/sketchpad-drawer.html`
  - `/tools/miscellaneous/rich-text-notepad.html`
  - `/tools/miscellaneous/sticky-notes-board.html`
  - `/tools/miscellaneous/code-snippet-notebook.html`
  - `/tools/miscellaneous/pixel-art-canvas.html`
  - `/tools/miscellaneous/todo-task-board.html`
  - `/tools/miscellaneous/pomodoro-focus-timer.html`
  - `/tools/miscellaneous/screen-ruler.html`
  - `/tools/miscellaneous/protractor-canvas.html`
  - `/tools/miscellaneous/digital-tally-counter.html`
  - `/tools/miscellaneous/virtual-piano-keyboard.html`
  - `/tools/miscellaneous/ambient-noise-mixer.html`
  - `/tools/miscellaneous/guitar-tuner-mic.html`
  - `/tools/miscellaneous/dice-roll-simulator.html`
  - `/tools/miscellaneous/color-blindness-tester.html`
  - `/tools/miscellaneous/morse-code-flasher.html`
  - `/tools/miscellaneous/password-strength-meter.html`
  - `/tools/miscellaneous/barcode-scanner-cam.html`
  - `/tools/miscellaneous/qr-code-designer.html`

---

#### 12. Client-Side Platform Software (`/software/`)
Categories structured by Operating System followed by type index:
- **Windows Platforms**:
  - `/software/windows/utility/index.html` (Core Utilities)
  - `/software/windows/productivity/index.html` (Productivity & Business)
  - `/software/windows/games/index.html` (Gaming & Entertainment)
  - `/software/windows/development/index.html` (Developer Tools)
  - `/software/windows/design/index.html` (Graphics & Design)
  - `/software/windows/security/index.html` (Security & Privacy)
  - `/software/windows/communication/index.html` (Internet & Communication)
  - `/software/windows/multimedia/index.html` (Multimedia / AV)
- **Linux Platforms**:
  - `/software/linux/utility/index.html`
  - `/software/linux/productivity/index.html`
  - `/software/linux/games/index.html`
  - `/software/linux/development/index.html`
  - `/software/linux/design/index.html`
  - `/software/linux/security/index.html`
  - `/software/linux/communication/index.html`
  - `/software/linux/multimedia/index.html`
- **Android Platforms**:
  - `/software/android/utility/index.html`
  - `/software/android/productivity/index.html`
  - `/software/android/games/index.html`
  - `/software/android/development/index.html`
  - `/software/android/design/index.html`
  - `/software/android/security/index.html`
  - `/software/android/communication/index.html`
  - `/software/android/multimedia/index.html`
- **Apple Platforms**:
  - `/software/apple/utility/index.html`
  - `/software/apple/productivity/index.html`
  - `/software/apple/games/index.html`
  - `/software/apple/development/index.html`
  - `/software/apple/design/index.html`
  - `/software/apple/security/index.html`
  - `/software/apple/communication/index.html`
  - `/software/apple/multimedia/index.html`

---

#### 13. Interactive Local Games (`/games/`)

- **Arcade & Action** (`/games/arcade/`):
  - Main Directory: `/games/arcade/index.html`
  - `/games/arcade/snake-canvas.html`
  - `/games/arcade/brick-breaker.html`
  - `/games/arcade/flappy-bird-clone.html`
  - `/games/arcade/space-invaders.html`
  - `/games/arcade/pacman-retro.html`
  - `/games/arcade/pong-paddle.html`
  - `/games/arcade/whack-a-mole.html`
  - `/games/arcade/asteroids-field.html`
  - `/games/arcade/frogger-road.html`
  - `/games/arcade/helicopter-tunnel.html`

- **Puzzles & Logic** (`/games/puzzles/`):
  - Main Directory: `/games/puzzles/index.html`
  - `/games/puzzles/sudoku-board.html`
  - `/games/puzzles/tetris-blocks.html`
  - `/games/puzzles/twenty-forty-eight.html`
  - `/games/puzzles/minesweeper-classic.html`
  - `/games/puzzles/maze-generator.html`
  - `/games/puzzles/sliding-block.html`
  - `/games/puzzles/tower-stacker.html`
  - `/games/puzzles/pipe-connector.html`
  - `/games/puzzles/lights-out.html`
  - `/games/puzzles/nonogram-griddlers.html`

- **Board & Tabletop** (`/games/board/`):
  - Main Directory: `/games/board/index.html`
  - `/games/board/chess-engine.html`
  - `/games/board/checkers-draughts.html`
  - `/games/board/tic-tac-toe.html`
  - `/games/board/connect-four.html`
  - `/games/board/backgammon-board.html`
  - `/games/board/reversi-othello.html`
  - `/games/board/ludo-classic.html`
  - `/games/board/dominoes-chain.html`
  - `/games/board/battleship-grid.html`
  - `/games/board/mancala-pit.html`

- **Card Games** (`/games/cards/`):
  - Main Directory: `/games/cards/index.html`
  - `/games/cards/solitaire-klondike.html`
  - `/games/cards/blackjack-twenty-one.html`
  - `/games/cards/spider-solitaire.html`
  - `/games/cards/poker-texas-holdem.html`
  - `/games/cards/freecell-classic.html`
  - `/games/cards/memory-card-match.html`
  - `/games/cards/hearts-card-game.html`
  - `/games/cards/uno-wild.html`
  - `/games/cards/gin-rummy.html`
  - `/games/cards/baccarat-table.html`

- **Word & Trivia Games** (`/games/word/`):
  - Main Directory: `/games/word/index.html`
  - `/games/word/wordle-clone.html`
  - `/games/word/hangman-classic.html`
  - `/games/word/typing-speed-racer.html`
  - `/games/word/crossword-puzzle.html`
  - `/games/word/anagram-scramble.html`
  - `/games/word/scrabble-helper-game.html`
  - `/games/word/trivia-quiz.html`
  - `/games/word/geo-quiz-map.html`
  - `/games/word/word-search-grid.html`
  - `/games/word/riddle-me-this.html`

---

#### 14. Developer Tutorials & Guides (`/tutorials/`)

- **Web Development** (`/tutorials/web-dev/`):
  - Main Directory: `/tutorials/web-dev/index.html`
  - `/tutorials/web-dev/html5-basics-for-beginners.html`
  - `/tutorials/web-dev/css3-flexbox-and-grid-guide.html`
  - `/tutorials/web-dev/javascript-dom-manipulation.html`
  - `/tutorials/web-dev/async-await-and-fetch-api.html`
  - `/tutorials/web-dev/introduction-to-react-components.html`
  - `/tutorials/web-dev/responsive-web-design-media-queries.html`
  - `/tutorials/web-dev/building-single-page-applications.html`
  - `/tutorials/web-dev/localstorage-and-indexeddb-guide.html`
  - `/tutorials/web-dev/webgl-and-html5-canvas-basics.html`
  - `/tutorials/web-dev/deploying-static-websites-for-free.html`

- **Programming Languages** (`/tutorials/programming/`):
  - Main Directory: `/tutorials/programming/index.html`
  - `/tutorials/programming/python-syntax-and-data-structures.html`
  - `/tutorials/programming/object-oriented-programming-in-cpp.html`
  - `/tutorials/programming/java-memory-management-basics.html`
  - `/tutorials/programming/typescript-for-javascript-developers.html`
  - `/tutorials/programming/rust-ownership-and-borrowing.html`
  - `/tutorials/programming/golang-concurrency-with-goroutines.html`
  - `/tutorials/programming/csharp-dotnet-core-fundamentals.html`
  - `/tutorials/programming/functional-programming-concepts.html`
  - `/tutorials/programming/regular-expressions-regex-tutorial.html`
  - `/tutorials/programming/data-structures-and-algorithms-guide.html`

- **Databases & DevOps** (`/tutorials/backend/`):
  - Main Directory: `/tutorials/backend/index.html`
  - `/tutorials/backend/sql-queries-join-and-select.html`
  - `/tutorials/backend/mongodb-crud-operations-guide.html`
  - `/tutorials/backend/git-version-control-and-github.html`
  - `/tutorials/backend/docker-containers-for-beginners.html`
  - `/tutorials/backend/linux-command-line-cheat-sheet.html`
  - `/tutorials/backend/building-restful-apis-with-node.html`
  - `/tutorials/backend/redis-caching-implementation-basics.html`
  - `/tutorials/backend/graphql-vs-rest-comparison-guide.html`
  - `/tutorials/backend/ci-cd-pipelines-with-github-actions.html`
  - `/tutorials/backend/ssh-key-setup-and-server-access.html`

- **Design & Multimedia** (`/tutorials/design/`):
  - Main Directory: `/tutorials/design/index.html`
  - `/tutorials/design/ui-ux-principles-for-clean-layouts.html`
  - `/tutorials/design/figma-prototyping-for-beginners.html`
  - `/tutorials/design/svg-vector-graphics-optimization.html`
  - `/tutorials/design/color-theory-and-palette-selection.html`
  - `/tutorials/design/typography-rules-for-web-interfaces.html`
  - `/tutorials/design/css-animations-and-transitions-guide.html`
  - `/tutorials/design/gimp-image-editing-basics.html`
  - `/tutorials/design/inkscape-vector-drawing-tutorial.html`
  - `/tutorials/design/blender-3d-modeling-introduction.html`
  - `/tutorials/design/video-editing-timeline-fundamentals.html`

- **Security & Networking** (`/tutorials/security/`):
  - Main Directory: `/tutorials/security/index.html`
  - `/tutorials/security/web-application-security-owasp-top-10.html`
  - `/tutorials/security/how-ssl-tls-certificates-work.html`
  - `/tutorials/security/understanding-jwt-and-session-auth.html`
  - `/tutorials/security/networking-basics-ip-subnets-dns.html`
  - `/tutorials/security/how-to-prevent-xss-and-sql-injection.html`
  - `/tutorials/security/hashing-vs-encryption-explained.html`
  - `/tutorials/security/setting-up-a-secure-firewall.html`
  - `/tutorials/security/cors-policy-errors-and-fixes.html`
  - `/tutorials/security/api-rate-limiting-strategies.html`
  - `/tutorials/security/symmetric-vs-asymmetric-cryptography.html`

---

#### 15. Educational Topics (`/education/`)

- **Mathematics** (`/education/math/`):
  - Main Directory: `/education/math/index.html`
  - `/education/math/pre-algebra-essentials.html`
  - `/education/math/understanding-fractions-and-decimals.html`
  - `/education/math/introduction-to-geometry-shapes.html`
  - `/education/math/algebra-linear-equations-solving.html`
  - `/education/math/trigonometry-sine-cosine-tangent.html`
  - `/education/math/calculus-limits-and-derivatives.html`
  - `/education/math/probability-and-statistics-basics.html`
  - `/education/math/matrices-and-linear-algebra.html`
  - `/education/math/binary-and-hexadecimal-number-systems.html`
  - `/education/math/discrete-mathematics-logic.html`

- **Science & Physics** (`/education/science/`):
  - Main Directory: `/education/science/index.html`
  - `/education/science/understanding-the-periodic-table.html`
  - `/education/science/fundamentals-of-chemical-bonding.html`
  - `/education/science/newtons-laws-of-motion.html`
  - `/education/science/thermodynamics-and-heat-transfer.html`
  - `/education/science/introduction-to-organic-chemistry.html`
  - `/education/science/cell-biology-structure-and-function.html`
  - `/education/science/genetics-and-dna-replication-explained.html`
  - `/education/science/basics-of-astronomy-and-planets.html`
  - `/education/science/human-anatomy-and-body-systems.html`
  - `/education/science/ecosystems-and-environmental-science.html`

- **Humanities & History** (`/education/humanities/`):
  - Main Directory: `/education/humanities/index.html`
  - `/education/humanities/world-history-major-turning-points.html`
  - `/education/humanities/ancient-civilizations-egypt-greece-rome.html`
  - `/education/humanities/introduction-to-political-science.html`
  - `/education/humanities/basics-of-macroeconomics.html`
  - `/education/humanities/microeconomics-supply-and-demand.html`
  - `/education/humanities/world-geography-continents-and-climate-zones.html`
  - `/education/humanities/fundamentals-of-human-psychology.html`
  - `/education/humanities/introduction-to-western-philosophy.html`
  - `/education/humanities/sociology-and-cultural-studies.html`
  - `/education/humanities/environmental-geography-and-mapping.html`

- **Languages & Literature** (`/education/languages/`):
  - Main Directory: `/education/languages/index.html`
  - `/education/languages/english-grammar-tenses-and-structures.html`
  - `/education/languages/essay-writing-and-structuring-arguments.html`
  - `/education/languages/literary-devices-metaphor-irony-symbolism.html`
  - `/education/languages/spanish-vocabulary-for-beginners.html`
  - `/education/languages/french-pronunciation-and-basics.html`
  - `/education/languages/reading-comprehension-strategies.html`
  - `/education/languages/creative-writing-and-character-building.html`
  - `/education/languages/public-speaking-and-rhetoric.html`
  - `/education/languages/professional-business-writing-etiquette.html`
  - `/education/languages/speed-reading-techniques.html`

- **Finance & Business Literacy** (`/education/finance/`):
  - Main Directory: `/education/finance/index.html`
  - `/education/finance/personal-budgeting-and-saving-strategies.html`
  - `/education/finance/how-compound-interest-works.html`
  - `/education/finance/understanding-stocks-bonds-and-mutual-funds.html`
  - `/education/finance/basics-of-taxation-and-income.html`
  - `/education/finance/credit-scores-and-debt-management.html`
  - `/education/finance/introduction-to-corporate-accounting.html`
  - `/education/finance/how-banking-and-central-banks-operate.html`
  - `/education/finance/basics-of-real-estate-investing.html`
  - `/education/finance/cryptocurrency-and-blockchain-fundamentals.html`
  - `/education/finance/entrepreneurship-and-business-plan-creation.html`

---

## 3. Dynamic Rendering & Asset Importing

### A. Relative Asset Resolution Framework
Because the pages reside in deeply nested subdirectories, absolute asset imports fail if the site is opened locally via file protocol (`file:///`).
- **Path Resolution**: All page links, stylesheets, script inclusions, and dynamic component loader URLs (`header.html`, `footer.html`) must use relative path formatting.
- **Dynamic Loader**: The layout loader computes path depth to inject correct relative prefixes dynamically.

---

## 4. Privacy & Consent Systems (GDPR, CCPA, DPDP, PIPL, LGPD)
A client-side zero-database consent manager gates analytics and ad rendering:
- **IAB TCF v2.2**: Signals user consent to ad networks (Google AdSense) via standard `tcString` formatting.
- **Google Consent Mode v2**: Updates tracking status permissions dynamically.
- **Data Erasure Link**: Instant cookies/storage deletion option in footer.

---

## 5. Payments & E-Commerce Security (PCI-DSS)
- **Stripe & Razorpay Embedded Checkouts**: Captures card digits securely inside tokenized iframe overlays.
- **Gumroad Store Integration**: Integrates the native Gumroad overlay script (`embed.js`) for catalog checkout.
- **Patreon / Buy Me a Coffee**: Dynamic card structures configured with brand color standards.

---

## 6. Hosting & Cloudflare Configurations
- Custom DNS pointing godaddy registrar domain to Cloudflare Nameservers.
- Subdomain delegation (e.g. `blog.bluetext.in`).
- Strict CSP/HSTS header headers via Cloudflare Pages deployment configuration.

---

## 7. Agent Workflows & Codebase Memory Graphing (Spec Kit, Graphify, AgentScope)
To manage a codebase containing over 1,000 utilities efficiently:
- **Spec-Driven Development (Spec Kit)**: Features must follow a structured outline (Scenarios -> Requirements -> Checklist -> Execution -> Validation). The `.specify/` configuration tracks implementation progress.
- **Codebase Memory Graphing (Graphify)**: The project uses a knowledge graph (`graphify-out/graph.json`) generated by `graphify` to maintain symbol relationship tracking, allowing AI agents to query codebase dependencies.
- **Multi-Agent Runtime (AgentScope)**: Integrates with `agentscope` for orchestrating complex developer task cycles and testing agents in sandboxed environments.
- **Prompt Rules (dotclaude / Agent.md)**: Standard developer configurations, coding hooks, and security scans are loaded from `.claude/` using the instructions defined in `Agent.md`.

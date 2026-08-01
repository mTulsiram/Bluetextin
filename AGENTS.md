# AGENTS.md

## Test commands
npm test
npm run lint

## Tool page rules (MANDATORY — read before touching any page under pages/)

1. **Single-file apps only.** Every tool page is a completely self-contained HTML file.
   - All CSS lives inside a `<style>` block in that file.
   - All JavaScript lives inside a `<script>` block in that file.
   - All icons are inline SVG — no CDN, no external icon libraries.
   - **No** `<link rel="stylesheet">` to shared CSS.
   - **No** `<script src="...">` to any external URL or shared JS file.
   - **No** header/footer injection scripts.

2. **No automated header/footer/nav injection.** Do not add, run, or wire up any script
   that injects shared HTML components (headers, footers, nav bars) into tool pages.
   Each page is standalone.

3. **No external CDN dependencies at runtime.** Zero network requests to any domain
   other than localhost when the page loads. If you need a library, copy its source
   directly into the `<script>` block.

4. **No loop/scheduling scripts.** Do not create or run automated agents, cron loops,
   or scheduled tasks against this repo. `loop-run-log.md`, `loop-budget.md`,
   `loop-constraints.md`, `LOOP.md`, `STATE.md` are banned — delete if recreated.

5. **No AI-agent config folders.** `.agent`, `.agents`, `.foundry`, `.gemini`, `.grok`,
   `.gsd`, `.jules` and similar dot-folders are banned — delete if recreated.

6. **Existing IDs and classes are contracts.** When editing a tool page, never rename
   an existing `id` or `class` that JavaScript hooks into. Add new ones; never rename.

# AGENTS.md

## Test commands
npm test
npm run lint

## Tool page rules (MANDATORY for pages/)

1. Tool pages are single-file HTML apps only.
2. Keep all CSS in-file `<style>` and all JS in-file `<script>`.
3. Icons must be inline SVG only.
4. No external CSS/JS links and no CDN runtime dependencies.
5. No header/footer/nav injection scripts.
6. No loop/scheduling artifacts: `loop-run-log.md`, `loop-budget.md`, `loop-constraints.md`, `LOOP.md`, `STATE.md`.
7. No AI-agent config folders: `.agent`, `.agents`, `.foundry`, `.gemini`, `.grok`, `.gsd`, `.jules`.
8. Existing IDs/classes used by JS are contracts: add only, do not rename.

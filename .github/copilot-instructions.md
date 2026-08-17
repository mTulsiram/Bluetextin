# Copilot Low-Token Rules

Default for this repo unless user overrides:

- Smallest safe change, one pass.
- Keep output terse: code-first; short bullets only when explanation is needed.
- Ask one short clarification only if ambiguity blocks a safe edit.
- Read minimal file ranges; avoid broad scans.
- Prefer one `apply_patch` per edited file.
- Avoid repeated page snapshots/reloads; do one targeted UI check by default.
- Run `get_errors` once after edits.
- Preserve existing IDs/classes and JS hooks.
- No out-of-scope refactors.
- Return only: changed file(s), what changed, quick validation.

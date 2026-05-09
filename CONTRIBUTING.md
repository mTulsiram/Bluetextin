# Contributing to Bluetext.in

Thanks for your interest in contributing.

## Development setup

1. Clone the repository.
2. Start a static server from the project root.
3. Open the site at `http://127.0.0.1:3000` (or your server port).

Example using Node:

```bash
npx serve . -l 3000
```

## Project principles

- Keep pages static (HTML, CSS, vanilla JS).
- Preserve privacy-first behavior (no unnecessary tracking).
- Reuse shared runtime and data files instead of duplicating logic.
- Keep category names aligned with `assets/data/navigation.json` and `assets/data/category-aliases.json`.

## Localization workflow

Locale routes are URL-based (`/en/`, `/hi/`, `/fr/`, etc.).

When UI strings change:

1. Update `assets/lang/ui.json` English source keys.
2. Sync missing keys and translate fallbacks:

```powershell
./scripts-dev/sync-ui-translations.ps1 -TranslateMissing -TranslateEnglishFallback
```

3. Translate tool catalog text and locale HTML content:

```powershell
./scripts-dev/translate-localized-content.ps1 -TranslateData -TranslateHtml
```

4. Generate/refresh locale route stubs if needed:

```powershell
./scripts-dev/generate-locale-stubs.ps1
```

5. Audit translation coverage:

```powershell
./scripts-dev/audit-translation-coverage.ps1
```

## Pull request checklist

- [ ] Changes are scoped and focused.
- [ ] No unrelated formatting churn.
- [ ] Localized strings updated where needed.
- [ ] `tools-platform/all-tools.html` still loads and filters correctly.
- [ ] Core localized pages load: `/en/index.html`, `/hi/index.html`, `/fr/index.html`.
- [ ] No new console errors on changed pages.

## Reporting bugs and features

Use GitHub Issues templates:

- Bug report
- Feature request

## Code of conduct

Be respectful and constructive in all interactions.

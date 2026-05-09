# Bluetext.in

Bluetext.in is a fast, privacy-focused static web platform for online utilities.

- Production: https://www.bluetext.in
- Repository: https://github.com/mTulsiram/Bluetextin
- Stack: HTML, CSS, vanilla JavaScript, JSON data files
- Deployment: Cloudflare Pages

## Current platform snapshot

- Total tools: 90
- Ready tools: 58
- Coming soon tools: 32
- Games: 10
- Discovery page: `tools-platform/all-tools.html`
- URL-localized routes: `/en/`, `/hi/`, `/fr/`, and additional locale folders

## Project structure

Key paths:

- `assets/data/tools.json`: canonical tool catalog
- `assets/data/navigation.json`: navigation and category metadata
- `assets/lang/ui.json`: shared UI dictionary for all locales
- `assets/js/partials.js`: header/footer loading, locale routing, runtime i18n
- `assets/js/main.js`: homepage runtime, featured tools, search
- `tools-platform/all-tools.html`: searchable catalog and category navigation
- `components/header.html` and `components/footer.html`: shared UI partials
- `scripts-dev/`: maintenance and migration scripts

## Local development

Run a static server from project root.

Example:

```bash
npx serve . -l 3000
```

Open:

- `http://127.0.0.1:3000/`
- `http://127.0.0.1:3000/en/index.html`
- `http://127.0.0.1:3000/en/tools-platform/all-tools.html`

## Localization workflow

Bluetext.in uses URL-based locales and runtime dictionary loading. No Google Translate widget is used.

When UI strings change, run:

```powershell
./scripts-dev/sync-ui-translations.ps1 -TranslateMissing -TranslateEnglishFallback
```

When tool names/descriptions and localized HTML pages need refresh, run:

```powershell
./scripts-dev/translate-localized-content.ps1 -TranslateData -TranslateHtml
```

If needed, regenerate locale route stubs:

```powershell
./scripts-dev/generate-locale-stubs.ps1
```

Audit translation coverage:

```powershell
./scripts-dev/audit-translation-coverage.ps1
```

One-command maintenance run:

```powershell
./scripts-dev/run-localization-maintenance.ps1
```

## Contribution

See `CONTRIBUTING.md` for contributor workflow and quality checks.

### Raise issues

GitHub issue templates are included:

- Bug report
- Feature request

They are located in `.github/ISSUE_TEMPLATE/`.

## Funding and support

Funding is configured through `.github/FUNDING.yml`:

- Patreon: https://www.patreon.com/BlueTEXT
- Ko-fi: https://ko-fi.com/bluetextin
- Buy Me a Coffee: https://www.buymeacoffee.com/BlueTEXT.in

## Security

See `SECURITY.md` for vulnerability reporting guidance.

## License

This project is licensed under the GPL-3.0 license. See `LICENSE`.

param(
  [switch]$RegenerateLocaleStubs,
  [string[]]$Locales = @("zh-CN","hi","es","fr","ar","bn","pt","ru","ur","id","de","ja","sw","mr","te","tr","ta","vi","ko"),
  [int]$RequestDelayMs = 60,
  [int]$RequestTimeoutSec = 4
)

$ErrorActionPreference = "Stop"

Write-Output "Starting localization maintenance..."

if ($RegenerateLocaleStubs) {
  Write-Output "Generating locale route stubs..."
  ./scripts-dev/generate-locale-stubs.ps1
}

Write-Output "Syncing and auto-translating UI keys..."
./scripts-dev/sync-ui-translations.ps1 `
  -Locales $Locales `
  -TranslateMissing `
  -TranslateEnglishFallback `
  -RequestDelayMs $RequestDelayMs `
  -RequestTimeoutSec $RequestTimeoutSec

Write-Output "Translating tool/catalog data and localized HTML content..."
./scripts-dev/translate-localized-content.ps1 `
  -Locales $Locales `
  -TranslateData `
  -TranslateHtml `
  -RequestDelayMs $RequestDelayMs `
  -RequestTimeoutSec $RequestTimeoutSec

Write-Output "Auditing translation coverage..."
./scripts-dev/audit-translation-coverage.ps1

Write-Output "Localization maintenance completed."

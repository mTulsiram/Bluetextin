$ErrorActionPreference = "Stop"

$jsonPath = "assets/lang/ui.json"
if (-not (Test-Path $jsonPath)) {
  throw "Missing $jsonPath"
}

$data = Get-Content -Raw $jsonPath | ConvertFrom-Json
$locales = @("en","zh-CN","hi","es","fr","ar","bn","pt","ru","ur","id","de","ja","sw","mr","te","tr","ta","vi","ko")
$enKeys = @($data.en.PSObject.Properties.Name)

$rows = foreach ($locale in $locales) {
  $keys = @()
  if ($data.PSObject.Properties.Name -contains $locale) {
    $keys = @($data.$locale.PSObject.Properties.Name)
  }
  [PSCustomObject]@{
    Locale = $locale
    Keys = $keys.Count
    MissingVsEn = $enKeys.Count - $keys.Count
    CoveragePct = if ($enKeys.Count -eq 0) { 100 } else { [Math]::Round(($keys.Count * 100.0 / $enKeys.Count), 1) }
  }
}

$rows | Sort-Object CoveragePct, Locale | Format-Table -AutoSize

$report = @()
$report += "# Translation Coverage"
$report += ""
$report += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += ""
$report += "| Locale | Keys | Missing vs en | Coverage % |"
$report += "|---|---:|---:|---:|"
$rows | Sort-Object Locale | ForEach-Object {
  $report += "| $($_.Locale) | $($_.Keys) | $($_.MissingVsEn) | $($_.CoveragePct) |"
}

Set-Content -Path "tools-platform/translation-coverage.md" -Value ($report -join "`r`n") -Encoding UTF8
Write-Output "Wrote tools-platform/translation-coverage.md"

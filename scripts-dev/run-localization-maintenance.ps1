param(
  [switch]$RegenerateLocaleStubs,
  [switch]$SyncUiTranslations,
  [switch]$TranslateContent,
  [switch]$AuditCoverage,
  [string[]]$Locales = @("zh-CN","hi","es","fr","ar","bn","pt","ru","ur","id","de","ja","sw","mr","te","tr","ta","vi","ko"),
  [int]$RequestDelayMs = 60,
  [int]$RequestTimeoutSec = 4,
  [string]$UiJsonPath = "assets/lang/ui.json"
)

$ErrorActionPreference = "Stop"

# If no specific switches are provided, default to running all stages
$runAll = -not ($RegenerateLocaleStubs -or $SyncUiTranslations -or $TranslateContent -or $AuditCoverage)
if ($runAll) {
  $RegenerateLocaleStubs = $true
  $SyncUiTranslations = $true
  $TranslateContent = $true
  $AuditCoverage = $true
}

$translationCache = @{}

# Shared Google Translate API client
function Get-TranslatedText {
  param(
    [string]$Text,
    [string]$TargetLocale,
    [int]$TimeoutSec
  )

  if ([string]::IsNullOrWhiteSpace($Text)) { return $Text }

  $cacheKey = "$TargetLocale|$Text"
  if ($translationCache.ContainsKey($cacheKey)) {
    return $translationCache[$cacheKey]
  }

  $encoded = [uri]::EscapeDataString($Text)
  $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=$TargetLocale&dt=t&q=$encoded"

  try {
    $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
    if ($null -eq $response -or [string]::IsNullOrWhiteSpace($response.Content)) {
      $translationCache[$cacheKey] = $Text
      return $Text
    }

    $result = $response.Content | ConvertFrom-Json -Depth 12
    if ($null -eq $result -or -not ($result -is [System.Collections.IList]) -or $result.Count -eq 0) {
      $translationCache[$cacheKey] = $Text
      return $Text
    }

    $segmentsRoot = $result[0]
    if ($null -eq $segmentsRoot -or -not ($segmentsRoot -is [System.Collections.IList])) {
      $translationCache[$cacheKey] = $Text
      return $Text
    }

    $segments = @()
    foreach ($segment in $segmentsRoot) {
      if ($segment -is [System.Collections.IList] -and $segment.Count -gt 0 -and $null -ne $segment[0]) {
        $segments += [string]$segment[0]
      }
    }

    $joined = ($segments -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($joined)) {
      $translationCache[$cacheKey] = $Text
      return $Text
    }

    $translationCache[$cacheKey] = $joined
    return $joined
  } catch {
    $translationCache[$cacheKey] = $Text
    return $Text
  }
}

function Test-TranslatableText {
  param([string]$Text)

  if ([string]::IsNullOrWhiteSpace($Text)) { return $false }
  $trimmed = $Text.Trim()
  if ($trimmed.Length -lt 2) { return $false }
  if ($trimmed -notmatch "[A-Za-z]") { return $false }
  if ($trimmed.Contains("{{") -or $trimmed.Contains("}}") -or $trimmed.Contains("<%") -or $trimmed.Contains("%>")) { return $false }
  if ($trimmed -match "^(https?:|mailto:|tel:|\/|#)") { return $false }
  return $true
}

function Translate-KeptWhitespaceText {
  param(
    [string]$Text,
    [string]$Locale,
    [int]$TimeoutSec,
    [int]$DelayMs
  )

  if (-not (Test-TranslatableText -Text $Text)) {
    return $Text
  }

  $leadingMatch = [regex]::Match($Text, "^\s*")
  $trailingMatch = [regex]::Match($Text, "\s*$")
  $leading = $leadingMatch.Value
  $trailing = $trailingMatch.Value
  $coreLength = $Text.Length - $leading.Length - $trailing.Length

  if ($coreLength -le 0) {
    return $Text
  }

  $core = $Text.Substring($leading.Length, $coreLength)
  $translated = Get-TranslatedText -Text $core -TargetLocale $Locale -TimeoutSec $TimeoutSec
  Start-Sleep -Milliseconds $DelayMs

  return "$leading$translated$trailing"
}

function Ensure-Directory {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function ConvertTo-Hashtable {
  param([object]$InputObject)

  if ($null -eq $InputObject) { return @{} }
  if ($InputObject -is [hashtable]) { return $InputObject }

  $hash = @{}
  foreach ($prop in $InputObject.PSObject.Properties) {
    $hash[$prop.Name] = $prop.Value
  }
  return $hash
}

Write-Output "Starting unified localization maintenance script..."

# ── STAGE 1: Generate Locale Stubs ──
if ($RegenerateLocaleStubs) {
  Write-Output "Stage 1: Generating route stubs for localized landing pages..."
  $routes = @(
    @{ Relative = "index.html"; Target = "/index.html" },
    @{ Relative = "nav/about.html"; Target = "/nav/about.html" },
    @{ Relative = "nav/accessibility.html"; Target = "/nav/accessibility.html" },
    @{ Relative = "nav/compliance.html"; Target = "/nav/compliance.html" },
    @{ Relative = "nav/contact.html"; Target = "/nav/contact.html" },
    @{ Relative = "nav/disclaimer.html"; Target = "/nav/disclaimer.html" },
    @{ Relative = "nav/privacy.html"; Target = "/nav/privacy.html" },
    @{ Relative = "nav/security.html"; Target = "/nav/security.html" },
    @{ Relative = "nav/terms.html"; Target = "/nav/terms.html" },
    @{ Relative = "tools-platform/all-tools.html"; Target = "/tools-platform/all-tools.html" },
    @{ Relative = "wiki/index.html"; Target = "/wiki/index.html" }
  )

  foreach ($locale in $Locales) {
    foreach ($route in $routes) {
      $filePath = Join-Path $locale $route.Relative
      $dir = Split-Path -Parent $filePath
      if (-not [string]::IsNullOrWhiteSpace($dir)) {
        Ensure-Directory -Path $dir
      }

      $html = @"
<!doctype html>
<html lang="$locale">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BlueTEXT.in</title>
  <meta http-equiv="refresh" content="0;url=$($route.Target)">
  <script>
    localStorage.setItem("lang", "$locale");
    location.replace("$($route.Target)" + location.search + location.hash);
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
"@
      Set-Content -Path $filePath -Value $html -Encoding UTF8
    }

    $legacyNested = Join-Path $locale "en"
    if (Test-Path $legacyNested) {
      Remove-Item -Path $legacyNested -Recurse -Force
    }
  }
  Write-Output "Stage 1 completed."
}

# ── STAGE 2: Sync UI Translations ──
if ($SyncUiTranslations) {
  Write-Output "Stage 2: Syncing and auto-translating UI keys in ui.json..."
  if (-not (Test-Path $UiJsonPath)) {
    throw "File not found: $UiJsonPath"
  }

  $uiData = Get-Content -Raw $UiJsonPath | ConvertFrom-Json
  $root = ConvertTo-Hashtable $uiData

  if (-not $root.ContainsKey("en")) {
    throw "Missing 'en' dictionary in $UiJsonPath"
  }

  $en = ConvertTo-Hashtable $root["en"]
  $enKeys = @($en.Keys)

  foreach ($locale in $Locales) {
    if ($locale -eq "en") { continue }

    $localeDict = if ($root.ContainsKey($locale)) { ConvertTo-Hashtable $root[$locale] } else { @{} }

    $added = 0
    $translatedFallback = 0
    foreach ($key in $enKeys) {
      $hasValue = $localeDict.ContainsKey($key) -and -not [string]::IsNullOrWhiteSpace([string]$localeDict[$key])
      if ($hasValue -and -not (($localeDict[$key] -eq $en[$key]))) {
        continue
      }

      $source = [string]$en[$key]
      $localeDict[$key] = Get-TranslatedText -Text $source -TargetLocale $locale -TimeoutSec $RequestTimeoutSec
      Start-Sleep -Milliseconds $RequestDelayMs
      if ($hasValue -and ($localeDict[$key] -ne $source)) {
        $translatedFallback++
      }
      if (-not $hasValue) {
        $added++
      }
    }

    $root[$locale] = [pscustomobject]$localeDict
    Write-Output ("Locale {0}: filled {1} missing keys, translated fallback keys {2}" -f $locale, $added, $translatedFallback)
  }

  $ordered = [ordered]@{}
  $ordered["en"] = [pscustomobject]$en
  foreach ($locale in ($root.Keys | Where-Object { $_ -ne "en" } | Sort-Object)) {
    $ordered[$locale] = $root[$locale]
  }

  $ordered | ConvertTo-Json -Depth 20 | Set-Content -Path $UiJsonPath -Encoding UTF8
  Write-Output "Updated $UiJsonPath"
  Write-Output "Stage 2 completed."
}

# ── STAGE 3: Translate Localized Content ──
if ($TranslateContent) {
  Write-Output "Stage 3: Translating tool/catalog data and localized HTML content..."
  
  foreach ($locale in $Locales) {
    if ([string]::IsNullOrWhiteSpace($locale) -or $locale -eq "en") {
      continue
    }

    # Translate tools and navigation data
    $i18nDir = "assets/data/i18n"
    Ensure-Directory -Path $i18nDir

    $toolsSource = Get-Content -Raw "assets/data/tools.json" | ConvertFrom-Json
    $toolsTranslated = @()

    foreach ($tool in @($toolsSource.tools)) {
      $item = [ordered]@{}
      foreach ($prop in $tool.PSObject.Properties) {
        $name = $prop.Name
        $value = $prop.Value

        if ($name -eq "name" -or $name -eq "description") {
          $item[$name] = Translate-KeptWhitespaceText -Text ([string]$value) -Locale $locale -TimeoutSec $RequestTimeoutSec -DelayMs $RequestDelayMs
          continue
        }

        if ($name -eq "tags" -and $value -is [System.Collections.IEnumerable]) {
          $translatedTags = @()
          foreach ($tag in $value) {
            $translatedTags += Translate-KeptWhitespaceText -Text ([string]$tag) -Locale $locale -TimeoutSec $RequestTimeoutSec -DelayMs $RequestDelayMs
          }
          $item[$name] = $translatedTags
          continue
        }

        $item[$name] = $value
      }
      $toolsTranslated += [pscustomobject]$item
    }

    $toolsOut = [ordered]@{ tools = $toolsTranslated }
    $toolsOutPath = Join-Path $i18nDir ("tools.{0}.json" -f $locale)
    $toolsOut | ConvertTo-Json -Depth 15 | Set-Content -Path $toolsOutPath -Encoding UTF8

    $navSource = Get-Content -Raw "assets/data/navigation.json" | ConvertFrom-Json
    $navTranslated = @()

    foreach ($category in @($navSource.categories)) {
      $item = [ordered]@{}
      foreach ($prop in $category.PSObject.Properties) {
        $name = $prop.Name
        $value = $prop.Value

        if ($name -eq "label" -or $name -eq "description") {
          $item[$name] = Translate-KeptWhitespaceText -Text ([string]$value) -Locale $locale -TimeoutSec $RequestTimeoutSec -DelayMs $RequestDelayMs
        } else {
          $item[$name] = $value
        }
      }
      $navTranslated += [pscustomobject]$item
    }

    $navOut = [ordered]@{ categories = $navTranslated }
    $navOutPath = Join-Path $i18nDir ("navigation.{0}.json" -f $locale)
    $navOut | ConvertTo-Json -Depth 10 | Set-Content -Path $navOutPath -Encoding UTF8

    Write-Output ("Locale {0}: translated tools/navigation data" -f $locale)

    # Translate localized HTML stubs
    $localeDir = Join-Path "." $locale
    if (Test-Path $localeDir) {
      $translatedFiles = 0
      $targetFiles = Get-ChildItem -Path $localeDir -Recurse -File -Filter *.html

      foreach ($target in $targetFiles) {
        $relativeInsideLocale = [System.IO.Path]::GetRelativePath($localeDir, $target.FullName)
        $sourcePath = Join-Path "." $relativeInsideLocale

        if (Test-Path $sourcePath) {
          $sourceContent = Get-Content -Raw -Path $sourcePath
          $content = $sourceContent
          $content = [regex]::Replace($content, '(?i)(\b(?:href|src)\s*=\s*")(?:\./|\.\./)*assets/', '$1/assets/')
          $content = [regex]::Replace($content, '(?s)>(?<txt>[^<>]+)<', {
            param($m)
            $text = $m.Groups['txt'].Value
            $translated = Translate-KeptWhitespaceText -Text $text -Locale $locale -TimeoutSec $RequestTimeoutSec -DelayMs $RequestDelayMs
            return ">$translated<"
          })

          Set-Content -Path $target.FullName -Encoding UTF8 -Value $content
          $translatedFiles++
        }
      }
      Write-Output ("Locale {0}: translated {1} localized HTML files" -f $locale, $translatedFiles)
    }
  }
  Write-Output "Stage 3 completed."
}

# ── STAGE 4: Audit Translation Coverage ──
if ($AuditCoverage) {
  Write-Output "Stage 4: Auditing translation coverage..."
  if (-not (Test-Path $UiJsonPath)) {
    throw "Missing $UiJsonPath"
  }

  $data = Get-Content -Raw $UiJsonPath | ConvertFrom-Json
  $allLocales = @("en","zh-CN","hi","es","fr","ar","bn","pt","ru","ur","id","de","ja","sw","mr","te","tr","ta","vi","ko")
  $enKeys = @($data.en.PSObject.Properties.Name)

  $rows = foreach ($locale in $allLocales) {
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
  Write-Output "Stage 4 completed."
}

Write-Output "All localization maintenance stages completed successfully."

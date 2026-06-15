param(
  [string[]]$Locales = @("bn","pt","ru","ur","id","de","ja","sw","mr","te","tr","ta","vi","ko"),
  [switch]$TranslateHtml,
  [switch]$TranslateData,
  [int]$RequestDelayMs = 40,
  [int]$RequestTimeoutSec = 4
)

$ErrorActionPreference = "Stop"

if (-not $TranslateHtml -and -not $TranslateData) {
  $TranslateHtml = $true
  $TranslateData = $true
}

$cachePath = "assets/data/i18n/translation-cache.json"
$translationCache = @{}
if (Test-Path $cachePath) {
  try {
    $jsonObj = Get-Content -Raw -Path $cachePath | ConvertFrom-Json
    foreach ($prop in $jsonObj.PSObject.Properties) {
      $translationCache[$prop.Name] = $prop.Value
    }
    Write-Output "Loaded $($translationCache.Count) cached translations."
  } catch {
    $translationCache = @{}
  }
}

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
      return $Text
    }

    $result = $response.Content | ConvertFrom-Json -Depth 12
    if ($null -eq $result -or -not ($result -is [System.Collections.IList]) -or $result.Count -eq 0) {
      return $Text
    }

    $segmentsRoot = $result[0]
    if ($null -eq $segmentsRoot -or -not ($segmentsRoot -is [System.Collections.IList])) {
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
      return $Text
    }

    $translationCache[$cacheKey] = $joined
    return $joined
  } catch {
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
    [string]$Locale
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
  $translated = Get-TranslatedText -Text $core -TargetLocale $Locale -TimeoutSec $RequestTimeoutSec
  Start-Sleep -Milliseconds $RequestDelayMs

  return "$leading$translated$trailing"
}

function Ensure-Directory {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Translate-DataForLocale {
  param([string]$Locale)

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
        $item[$name] = Translate-KeptWhitespaceText -Text ([string]$value) -Locale $Locale
        continue
      }

      if ($name -eq "tags" -and $value -is [System.Collections.IEnumerable]) {
        $translatedTags = @()
        foreach ($tag in $value) {
          $translatedTags += Translate-KeptWhitespaceText -Text ([string]$tag) -Locale $Locale
        }
        $item[$name] = $translatedTags
        continue
      }

      $item[$name] = $value
    }

    $toolsTranslated += [pscustomobject]$item
  }

  $toolsOut = [ordered]@{ tools = $toolsTranslated }
  $toolsOutPath = Join-Path $i18nDir ("tools.{0}.json" -f $Locale)
  $toolsOut | ConvertTo-Json -Depth 15 | Set-Content -Path $toolsOutPath -Encoding UTF8

  $navSource = Get-Content -Raw "assets/data/navigation.json" | ConvertFrom-Json
  $navTranslated = @()

  foreach ($category in @($navSource.categories)) {
    $item = [ordered]@{}
    foreach ($prop in $category.PSObject.Properties) {
      $name = $prop.Name
      $value = $prop.Value

      if ($name -eq "label" -or $name -eq "description") {
        $item[$name] = Translate-KeptWhitespaceText -Text ([string]$value) -Locale $Locale
      } else {
        $item[$name] = $value
      }
    }

    $navTranslated += [pscustomobject]$item
  }

  $navOut = [ordered]@{ categories = $navTranslated }
  $navOutPath = Join-Path $i18nDir ("navigation.{0}.json" -f $Locale)
  $navOut | ConvertTo-Json -Depth 10 | Set-Content -Path $navOutPath -Encoding UTF8

  Write-Output ("Locale {0}: translated tools/navigation data" -f $Locale)
}

function Translate-HtmlForLocale {
  param([string]$Locale)

  $localeDir = Join-Path "." $Locale
  if (-not (Test-Path $localeDir)) {
    Write-Output ("Locale {0}: folder not found, skipping HTML" -f $Locale)
    return
  }

  $translatedFiles = 0
  $targetFiles = Get-ChildItem -Path $localeDir -Recurse -File -Filter *.html
  foreach ($target in $targetFiles) {
    $absLocaleDir = (Resolve-Path $localeDir).Path
    $relativeInsideLocale = $target.FullName.Substring($absLocaleDir.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar)
    $sourcePath = Join-Path "." $relativeInsideLocale

    if (-not (Test-Path $sourcePath)) {
      continue
    }

    $sourceContent = Get-Content -Raw -Path $sourcePath
    $content = $sourceContent
    $content = [regex]::Replace($content, '(?i)(\b(?:href|src)\s*=\s*")(?:\./|\.\./)*assets/', '$1/assets/')
    $content = [regex]::Replace($content, '(?s)>(?<txt>[^<>]+)<', {
      param($m)
      $text = $m.Groups['txt'].Value
      $translated = Translate-KeptWhitespaceText -Text $text -Locale $Locale
      return ">$translated<"
    })

    Set-Content -Path $target.FullName -Encoding UTF8 -Value $content
    $translatedFiles++
  }

  Write-Output ("Locale {0}: translated {1} localized HTML files" -f $Locale, $translatedFiles)
}

foreach ($locale in $Locales) {
  if ([string]::IsNullOrWhiteSpace($locale) -or $locale -eq "en") {
    continue
  }

  if ($TranslateData) {
    Translate-DataForLocale -Locale $locale
  }

  if ($TranslateHtml) {
    Translate-HtmlForLocale -Locale $locale
  }
}

# Save translation cache to disk
if ($translationCache.Count -gt 0) {
  $translationCache | ConvertTo-Json -Depth 5 | Set-Content -Path $cachePath -Encoding UTF8
  Write-Output "Saved $($translationCache.Count) translations to cache."
}

Write-Output "Completed localization content translation pipeline."

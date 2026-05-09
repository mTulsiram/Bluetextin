param(
  [string]$UiJsonPath = "assets/lang/ui.json",
  [string[]]$Locales = @("zh-CN","hi","es","fr","ar","bn","pt","ru","ur","id","de","ja","sw","mr","te","tr","ta","vi","ko"),
  [switch]$TranslateMissing,
  [switch]$TranslateEnglishFallback,
  [int]$RequestDelayMs = 120,
  [int]$RequestTimeoutSec = 6
)

$ErrorActionPreference = "Stop"

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

function Get-TranslatedText {
  param(
    [string]$Text,
    [string]$TargetLocale,
    [int]$TimeoutSec
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return $Text
  }

  $encoded = [uri]::EscapeDataString($Text)
  $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=$TargetLocale&dt=t&q=$encoded"
  try {
    $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
    if ($null -eq $response -or [string]::IsNullOrWhiteSpace($response.Content)) {
      return $Text
    }

    $result = $response.Content | ConvertFrom-Json -Depth 10
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
    return $joined
  } catch {
    return $Text
  }
}

if (-not (Test-Path $UiJsonPath)) {
  throw ("File not found: {0}" -f $UiJsonPath)
}

$data = Get-Content -Raw $UiJsonPath | ConvertFrom-Json
$root = ConvertTo-Hashtable $data

if (-not $root.ContainsKey("en")) {
  throw ("Missing 'en' dictionary in {0}" -f $UiJsonPath)
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
    if ($hasValue -and -not ($TranslateMissing -and $TranslateEnglishFallback -and ([string]$localeDict[$key] -eq [string]$en[$key]))) {
      continue
    }

    $source = [string]$en[$key]
    if ($TranslateMissing) {
      $localeDict[$key] = Get-TranslatedText -Text $source -TargetLocale $locale -TimeoutSec $RequestTimeoutSec
      Start-Sleep -Milliseconds $RequestDelayMs
      if ($hasValue -and ([string]$localeDict[$key] -ne [string]$source) -and $TranslateEnglishFallback) {
        $translatedFallback++
      }
    } else {
      $localeDict[$key] = $source
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

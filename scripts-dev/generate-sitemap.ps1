param(
  [string]$BaseUrl = "https://bluetext.in",
  [string]$OutputPath = "sitemap.xml"
)

function To-UrlPath {
  param(
    [string]$RelativePath
  )

  $normalized = "/" + (($RelativePath -replace '^[./\\]+', '') -replace '\\', '/')
  if ($normalized -eq "/index.html") {
    return "/"
  }

  return $normalized
}

function Get-PublicHtmlFiles {
  if (Test-Path ".") {
    Get-ChildItem -Path "." -File -Filter *.html
  }

  $locations = @("nav", "tools", "tools-platform", "wiki")

  foreach ($location in $locations) {
    if (-not (Test-Path $location)) {
      continue
    }

    Get-ChildItem -Path $location -Recurse -File -Filter *.html
  }
}

$projectRoot = (Get-Location).Path

$allUrls = Get-PublicHtmlFiles |
  Where-Object {
    $_.FullName -notmatch "\\components\\" -and
    $_.FullName -notmatch "\\tools-platform\\partials\\" -and
    $_.Name -ne "_tool-template.html" -and
    $_.Name -ne "404.html"
  } |
  ForEach-Object {
    $relativePath = [System.IO.Path]::GetRelativePath($projectRoot, $_.FullName)
    To-UrlPath -RelativePath $relativePath
  } |
  Sort-Object -Unique

$xml = New-Object System.Text.StringBuilder
[void]$xml.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$xml.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

foreach ($path in $allUrls) {
  $loc = "$BaseUrl$path"
  [void]$xml.AppendLine("  <url><loc>$loc</loc></url>")
}

[void]$xml.AppendLine('</urlset>')

Set-Content -Encoding UTF8 -Path $OutputPath -Value $xml.ToString()
Write-Output "Sitemap generated at $OutputPath with $($allUrls.Count) URLs."

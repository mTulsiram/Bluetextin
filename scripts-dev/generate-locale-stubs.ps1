param(
    [string[]]$Locales = @(
        "en", "zh-CN", "hi", "es", "fr", "ar", "bn", "pt", "ru", "ur",
        "id", "de", "ja", "sw", "mr", "te", "tr", "ta", "vi", "ko"
    )
)

$ErrorActionPreference = "Stop"

# Keep locale stubs limited to pages that have localized entry routes.
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
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
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

Write-Output "Generated locale stubs for $($Locales.Count) locales."

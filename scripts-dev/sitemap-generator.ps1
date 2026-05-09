# sitemap-generator.ps1
# =============================================================
# Generate sitemap.xml from tools.json and category structure
#
# Run: ./scripts-dev/sitemap-generator.ps1
# =============================================================

param(
    [string]$SitemapPath = "sitemap.xml",
    [string]$Domain = "https://bluetext.in"
)

# Load data
$toolsData = Get-Content "assets/data/tools.json" -Raw | ConvertFrom-Json
$navData = Get-Content "assets/data/navigation.json" -Raw | ConvertFrom-Json

# Build sitemap entries
$entries = @()

# 1. Static pages (high priority)
$staticPages = @(
    @{ path = "index.html"; priority = "1.0"; changefreq = "daily" },
    @{ path = "nav/about.html"; priority = "0.8"; changefreq = "monthly" },
    @{ path = "nav/contact.html"; priority = "0.7"; changefreq = "monthly" },
    @{ path = "nav/privacy.html"; priority = "0.6"; changefreq = "yearly" },
    @{ path = "nav/terms.html"; priority = "0.6"; changefreq = "yearly" },
    @{ path = "tools-platform/all-tools.html"; priority = "0.9"; changefreq = "weekly" },
    @{ path = "404.html"; priority = "0.3"; changefreq = "monthly" }
)

foreach ($page in $staticPages) {
    $entries += @{
        loc = "$Domain/$($page.path)"
        lastmod = (Get-Date -Format "yyyy-MM-dd")
        changefreq = $page.changefreq
        priority = $page.priority
    }
}

# 2. Category pages (medium priority)
foreach ($cat in $navData.categories) {
    $catPath = $cat.path -replace 'tools/', 'categories/'
    $catPath = $catPath -replace '/index.html', '.html'
    
    $entries += @{
        loc = "$Domain/$catPath"
        lastmod = (Get-Date -Format "yyyy-MM-dd")
        changefreq = "weekly"
        priority = "0.8"
    }
}

# 3. Ready tool pages only (medium-high priority)
foreach ($tool in $toolsData.tools) {
    if ($tool.status -eq "ready") {
        $entries += @{
            loc = "$Domain/$($tool.slug)"
            lastmod = (Get-Date -Format "yyyy-MM-dd")
            changefreq = "monthly"
            priority = $tool.featured ? "0.9" : "0.7"
        }
    }
}

# Build XML
$xml = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
"@

foreach ($entry in $entries) {
    $xml += @"

  <url>
    <loc>$($entry.loc)</loc>
    <lastmod>$($entry.lastmod)</lastmod>
    <changefreq>$($entry.changefreq)</changefreq>
    <priority>$($entry.priority)</priority>
  </url>
"@
}

$xml += @"

</urlset>
"@

# Write to file
$xml | Set-Content $SitemapPath -Encoding UTF8

Write-Host "✓ Generated sitemap.xml"
Write-Host "  Total entries: $($entries.Count)"
Write-Host "  Path: $SitemapPath"
Write-Host "  Ready tools: $($toolsData.tools | Where-Object { $_.status -eq 'ready' } | Measure-Object).Count"
Write-Host "  Categories: $($navData.categories.Count)"

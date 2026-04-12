# This script creates the HTML partial files for the category sidebar and mega menu.
# Ensure you run this script from the root of your project directory.

# --- Configuration ---

# Define the categories with FolderName, VisibleName, and an optional Emoji icon
$categories = @(
    [pscustomobject]@{FolderName = "ai-utilities"; VisibleName = "AI Utilities"; Emoji = "🤖"},
    [pscustomobject]@{FolderName = "audio-video"; VisibleName = "Audio & Video"; Emoji = "🎬"},
    [pscustomobject]@{FolderName = "calculators"; VisibleName = "Calculators"; Emoji = "🧮"},
    [pscustomobject]@{FolderName = "color-design"; VisibleName = "Color & Design"; Emoji = "🎨"},
    [pscustomobject]@{FolderName = "developer"; VisibleName = "Developer Tools"; Emoji = "💻"},
    [pscustomobject]@{FolderName = "domain-network"; VisibleName = "Network Tools"; Emoji = "🌐"},
    [pscustomobject]@{FolderName = "encoding"; VisibleName = "Encoding Tools"; Emoji = "🔒"},
    [pscustomobject]@{FolderName = "file-data"; VisibleName = "File Tools"; Emoji = "📁"},
    [pscustomobject]@{FolderName = "image"; VisibleName = "Image Tools"; Emoji = "🖼️"},
    [pscustomobject]@{FolderName = "pdf"; VisibleName = "PDF Converters"; Emoji = "📄"},
    [pscustomobject]@{FolderName = "programming"; VisibleName = "Programming"; Emoji = "👨‍💻"},
    [pscustomobject]@{FolderName = "seo"; VisibleName = "SEO Tools"; Emoji = "📈"},
    [pscustomobject]@{FolderName = "social-media"; VisibleName = "Social Media"; Emoji = "📱"},
    [pscustomobject]@{FolderName = "text"; VisibleName = "Text Tools"; Emoji = "✍️"},
    [pscustomobject]@{FolderName = "unit-converters"; VisibleName = "Unit Converters"; Emoji = "📏"},
    [pscustomobject]@{FolderName = "youtube"; VisibleName = "YouTube Tools"; Emoji = "▶️"}
)

# Define file paths
$basePath = Get-Location
$partialsPath = Join-Path -Path $basePath -ChildPath "tools-platform\partials"
$sidebarFile = Join-Path -Path $partialsPath -ChildPath "category-sidebar.html"
$megaMenuFile = Join-Path -Path $partialsPath -ChildPath "mega-menu.html"

# --- Script Execution ---

# 1. Create the partials directory if it doesn't exist
if (-not (Test-Path $partialsPath)) {
    New-Item -ItemType Directory -Path $partialsPath -Force
    Write-Host "Created directory: $partialsPath"
}

# 2. Generate and write the category-sidebar.html file
$sidebarLinks = $categories | ForEach-Object {
    "    <a href=`"/tools/$($_.FolderName)/`" class=`"sidebar-link`"><span>$($_.Emoji)</span> $($_.VisibleName)</a>"
}
$sidebarLinks = $sidebarLinks -join "`n"

$sidebarContent = @"
<nav class="category-sidebar">
    <h4>Tool Categories</h4>
$sidebarLinks
    <hr>
    <a href="/tools-platform/all-tools.html" class="sidebar-link all-tools-link"><span>✨</span> View All Tools</a>
</nav>
"@

Set-Content -Path $sidebarFile -Value $sidebarContent -Encoding UTF8
Write-Host "Successfully created and populated $sidebarFile"

# 3. Generate and write the mega-menu.html file
$megaMenuContent = @"
<div class="mega-menu">
    <div class="mega-menu-content">
        <div class="mega-column">
            <h4>Visual & Design</h4>
            <a href="/tools/image/">Image Tools</a>
            <a href="/tools/color-design/">Color & Design</a>
            <a href="/tools/audio-video/">Audio & Video</a>
        </div>
        <div class="mega-column">
            <h4>Text & Content</h4>
            <a href="/tools/text/">Text Tools</a>
            <a href="/tools/social-media/">Social Media</a>
            <a href="/tools/seo/">SEO Tools</a>
            <a href="/tools/pdf/">PDF Converters</a>
        </div>
        <div class="mega-column">
            <h4>Developer & Tech</h4>
            <a href="/tools/developer/">Developer Tools</a>
            <a href="/tools/programming/">Programming</a>
            <a href="/tools/domain-network/">Network Tools</a>
            <a href="/tools/encoding/">Encoding</a>
            <a href="/tools/ai-utilities/">AI Utilities</a>
        </div>
        <div class="mega-column">
            <h4>General Utilities</h4>
            <a href="/tools/calculators/">Calculators</a>
            <a href="/tools/unit-converters/">Unit Converters</a>
            <a href="/tools/file-data/">File Tools</a>
            <a href="/tools/youtube/">YouTube Tools</a>
        </div>
    </div>
    <div class="mega-menu-footer">
        <a href="/tools-platform/all-tools.html">View All Tools →</a>
    </div>
</div>
"@

Set-Content -Path $megaMenuFile -Value $megaMenuContent -Encoding UTF8
Write-Host "Successfully created and populated $megaMenuFile"

Write-Host "`nAutomation complete. Your partial HTML files are ready."

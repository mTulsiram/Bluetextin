
# Fix-ToolsJson.ps1
# Rebuilds tools.json by extracting original tools array and appending new entries

$path = "assets/data/tools.json"
$ls = [System.IO.File]::ReadAllLines($path)

# Find the last standalone "}" (root object close)
$rootClose = -1
for ($i = $ls.Count-1; $i -ge 0; $i--) {
    if ($ls[$i] -eq '}') { $rootClose = $i; break }
}

# Find the "]" that closes the tools array (just before rootClose)
$arrClose = -1
for ($i = $rootClose-1; $i -ge 0; $i--) {
    if ($ls[$i].Trim() -eq ']') { $arrClose = $i; break }
}

Write-Host "Root close: line $($rootClose+1)"
Write-Host "Array close: line $($arrClose+1)"
Write-Host "Last tool obj ends at: $($ls[$arrClose-1])"

# Build the new tools.json:
# Lines 0 to arrClose-1 = everything up to (but not including) the closing ]
# Then append new tool entries
# Then close the array and root object

$newTools = @'
	{
		"id": "lowercase-converter",
		"title": "Lowercase Converter",
		"description": "Convert text to lowercase, UPPERCASE, Title Case, camelCase, and more.",
		"category": "text",
		"path": "tools/text/case/lowercase-converter.html",
		"featured": false,
		"tags": ["text", "case", "lowercase"],
		"status": "ready"
	},
	{
		"id": "title-case-converter",
		"title": "Title Case Converter",
		"description": "Convert text to Title Case, lowercase, camelCase, kebab-case, and more.",
		"category": "text",
		"path": "tools/text/case/title-case-converter.html",
		"featured": false,
		"tags": ["text", "case", "title case"],
		"status": "ready"
	},
	{
		"id": "loan-calculator",
		"title": "Loan Calculator",
		"description": "Calculate monthly EMI and see a full amortization schedule for any loan.",
		"category": "calculators",
		"path": "tools/calculators/finance/loan-calculator.html",
		"featured": true,
		"tags": ["loan", "emi", "amortization", "finance"],
		"status": "ready"
	},
	{
		"id": "temperature-unit-converter",
		"title": "Temperature Converter",
		"description": "Convert between Celsius, Fahrenheit, Kelvin, and Rankine instantly.",
		"category": "converters",
		"path": "tools/converters/units/temperature-unit-converter.html",
		"featured": false,
		"tags": ["temperature", "celsius", "fahrenheit", "kelvin"],
		"status": "ready"
	},
	{
		"id": "schema-markup-generator",
		"title": "Schema Markup Generator",
		"description": "Generate JSON-LD structured data for articles, FAQs, products, and more.",
		"category": "seo",
		"path": "tools/seo/schema/schema-markup-generator.html",
		"featured": true,
		"tags": ["seo", "schema", "json-ld", "structured data"],
		"status": "ready"
	},
	{
		"id": "extract-pdf-pages",
		"title": "Extract PDF Pages",
		"description": "Extract specific pages from a PDF into a new file. Runs in browser.",
		"category": "pdf",
		"path": "tools/pdf/extract/extract-pdf-pages.html",
		"featured": false,
		"tags": ["pdf", "extract", "pages"],
		"status": "ready"
	},
	{
		"id": "image-compressor",
		"title": "Image Compressor",
		"description": "Compress JPEG, PNG, and WebP images by adjusting quality and output format.",
		"category": "images",
		"path": "tools/images/convert/image-compressor.html",
		"featured": true,
		"tags": ["image", "compress", "reduce size", "jpeg", "webp"],
		"status": "ready"
	},
	{
		"id": "file-compare",
		"title": "File Compare",
		"description": "Upload two text files and see line-by-line differences instantly.",
		"category": "files",
		"path": "tools/files/compare/file-compare.html",
		"featured": false,
		"tags": ["file", "compare", "diff"],
		"status": "ready"
	},
	{
		"id": "excel-to-json",
		"title": "Excel / CSV to JSON",
		"description": "Convert Excel (.xlsx) or CSV files to JSON instantly in your browser.",
		"category": "files",
		"path": "tools/files/spreadsheet/excel-to-json.html",
		"featured": false,
		"tags": ["excel", "csv", "json", "convert", "spreadsheet"],
		"status": "ready"
	},
	{
		"id": "currency-converter",
		"title": "Currency Converter",
		"description": "Convert currencies using live exchange rates.",
		"category": "converters",
		"path": "tools/converters/currency/currency-converter.html",
		"featured": false,
		"tags": ["currency", "exchange", "forex"],
		"status": "coming-soon"
	},
	{
		"id": "background-remover",
		"title": "Background Remover",
		"description": "Remove image backgrounds using AI.",
		"category": "images",
		"path": "tools/images/remove/background-remover.html",
		"featured": true,
		"tags": ["image", "background", "remove", "ai"],
		"status": "coming-soon"
	},
	{
		"id": "protect-pdf",
		"title": "Protect PDF",
		"description": "Password-protect your PDF files.",
		"category": "pdf",
		"path": "tools/pdf/security/protect-pdf.html",
		"featured": false,
		"tags": ["pdf", "password", "protect", "security"],
		"status": "coming-soon"
	},
	{
		"id": "pdf-to-word",
		"title": "PDF to Word",
		"description": "Convert PDF documents to editable Word (.docx) files.",
		"category": "pdf",
		"path": "tools/pdf/convert/pdf-to-word.html",
		"featured": false,
		"tags": ["pdf", "word", "convert", "docx"],
		"status": "coming-soon"
	},
	{
		"id": "word-to-pdf",
		"title": "Word to PDF",
		"description": "Convert Word (.docx) documents to PDF.",
		"category": "pdf",
		"path": "tools/pdf/convert/word-to-pdf.html",
		"featured": false,
		"tags": ["word", "pdf", "convert", "docx"],
		"status": "coming-soon"
	},
	{
		"id": "page-speed-checker",
		"title": "Page Speed Checker",
		"description": "Analyse your website's performance using Google PageSpeed Insights.",
		"category": "seo",
		"path": "tools/seo/analysis/page-speed-checker.html",
		"featured": false,
		"tags": ["seo", "speed", "performance", "pagespeed"],
		"status": "coming-soon"
	},
	{
		"id": "broken-link-checker",
		"title": "Broken Link Checker",
		"description": "Scan your website for broken links and 404 errors.",
		"category": "seo",
		"path": "tools/seo/links/broken-link-checker.html",
		"featured": false,
		"tags": ["seo", "links", "broken", "404"],
		"status": "coming-soon"
	},
	{
		"id": "file-merger",
		"title": "File Merger",
		"description": "Merge multiple text files into one combined file.",
		"category": "files",
		"path": "tools/files/merge-split/file-merger.html",
		"featured": false,
		"tags": ["file", "merge", "combine"],
		"status": "coming-soon"
	}
'@

# Construct result
$parts = $ls[0..($arrClose-1)]  # lines before closing ]

# Make sure the last line ends with a comma
if ($parts[-1].Trim() -eq '}') {
    $parts[-1] = $parts[-1] + ","
}

$result = ($parts -join "`n") + "`n" + $newTools + "`n`t]`n}"

# Write file
[System.IO.File]::WriteAllText($path, $result, [System.Text.UTF8Encoding]::new($false))

# Validate
try {
    $parsed = $result | ConvertFrom-Json
    Write-Host "SUCCESS: Valid JSON. Tools: $($parsed.tools.Count)"
} catch {
    Write-Host "FAIL: $_"
}

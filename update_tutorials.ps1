function Replace-Main {
  param([string]$fp, [string]$main)
  $c = [System.IO.File]::ReadAllText($fp, [System.Text.Encoding]::UTF8)
  $pat = '(?s)  <main class="container py-4" id="main-content">.*?</main>'
  $r = [regex]::Replace($c, $pat, $main)
  [System.IO.File]::WriteAllText($fp, $r, [System.Text.Encoding]::UTF8)
  Write-Host "Updated: $fp"
}
Replace-Main "pages\tutorials\backend\building-restful-apis-with-node.html" "  <main>TEST</main>"

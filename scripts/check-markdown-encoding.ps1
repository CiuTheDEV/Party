param(
  [string]$Root = "."
)

$patterns = @(
  [string][char]0x00E2,
  [string][char]0x00C4,
  [string][char]0x0139,
  [string][char]0x00C5,
  [string][char]0x0102,
  [string][char]0x010F,
  [string][char]0xFFFD
)

$files = Get-ChildItem -Path $Root -Recurse -File -Filter *.md | Where-Object {
  $_.FullName -notmatch "\\node_modules\\" -and
  $_.FullName -notmatch "\\.git\\" -and
  $_.FullName -notmatch "\\.next\\" -and
  $_.FullName -notmatch "\\.turbo\\" -and
  $_.FullName -notmatch "\\.codex\\"
}

$badFiles = @()

foreach ($file in $files) {
  $text = [System.IO.File]::ReadAllText($file.FullName)
  foreach ($pattern in $patterns) {
    if ($text.Contains($pattern)) {
      $badFiles += $file.FullName
      break
    }
  }
}

if ($badFiles.Count -gt 0) {
  Write-Error "Markdown encoding check failed. Suspicious files:`n$($badFiles -join "`n")"
  exit 1
}

Write-Output "Markdown encoding check passed."

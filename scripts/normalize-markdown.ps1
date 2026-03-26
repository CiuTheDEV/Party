param(
  [string]$Root = "."
)

$utf8 = New-Object System.Text.UTF8Encoding($false)

function Convert-ToSafeMarkdown {
  param(
    [string]$Text
  )

  $converted = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::GetEncoding(1252).GetBytes($Text))
  $converted = $converted.Replace([string][char]0xFFFD, "-")

  $replacements = [ordered]@{}
  $replacements[[string][char]0x2014] = "-"
  $replacements[[string][char]0x2013] = "-"
  $replacements[[string][char]0x2192] = "->"
  $replacements[[string][char]0x2190] = "<-"
  $replacements[[string][char]0x2264] = "<="
  $replacements[[string][char]0x2265] = ">="
  $replacements[[string][char]0x2026] = "..."
  $replacements[[string][char]0x201C] = '"'
  $replacements[[string][char]0x201D] = '"'
  $replacements[[string][char]0x2019] = "'"
  $replacements[[string][char]0x2022] = "-"
  $replacements[[string][char]0x2713] = "[done]"
  $replacements[[string]([char]0x26A0)] = "Warning:"
  $replacements[([string][char]0x251C) + ([string][char]0x2500) + ([string][char]0x2500)] = "|--"
  $replacements[([string][char]0x2514) + ([string][char]0x2500) + ([string][char]0x2500)] = "\\--"
  $replacements[[string][char]0x2502] = "|"

  foreach ($key in $replacements.Keys) {
    $converted = $converted.Replace($key, $replacements[$key])
  }

  $normalized = $converted.Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object System.Text.StringBuilder

  foreach ($char in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($char)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($char)
    }
  }

  $ascii = [regex]::Replace($builder.ToString(), "[^\u0009\u000A\u000D\u0020-\u007E]", "")
  $ascii = [regex]::Replace($ascii, "(?<=\w)\?(?=\w)", "o")
  $ascii = [regex]::Replace($ascii, "\s\?\s", " - ")
  $ascii = $ascii.Replace(" ?`r`n", " -`r`n").Replace(" ?`n", " -`n")
  return $ascii
}

$files = Get-ChildItem -Path $Root -Recurse -File -Filter *.md | Where-Object {
  $_.FullName -notmatch "\\node_modules\\" -and
  $_.FullName -notmatch "\\.git\\" -and
  $_.FullName -notmatch "\\.next\\" -and
  $_.FullName -notmatch "\\.turbo\\" -and
  $_.FullName -notmatch "\\.codex\\"
}

foreach ($file in $files) {
  $text = [System.IO.File]::ReadAllText($file.FullName)
  $fixed = Convert-ToSafeMarkdown -Text $text
  [System.IO.File]::WriteAllText($file.FullName, $fixed, $utf8)
}

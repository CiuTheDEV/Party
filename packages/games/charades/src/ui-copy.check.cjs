const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const checks = [
  {
    relativePath: 'src/setup/components/CategoryPicker.tsx',
    expectedPhrases: [
      'Wyczy\\u015b\\u0107 wyb\\u00f3r kategorii',
      '\\u0141atwe',
      'Zarz\\u0105dzaj pul\\u0105 unikalnych hase\\u0142',
      'Ca\\u0142a pula',
      'Wszystkie zu\\u017cyte i odrzucone has\\u0142a wr\\u00f3c\\u0105 do u\\u017cycia w tej sesji.',
    ],
  },
  {
    relativePath: 'src/runtime/play/PlaySettingsModal.tsx',
    expectedPhrases: [
      'Na pewno wr\\u00f3ci\\u0107 do menu?',
      'Bie\\u017c\\u0105ca rozgrywka zostanie przerwana.',
      'Zosta\\u0144 w grze',
      'Tak, wr\\u00f3\\u0107 do menu',
      'D\\u017awi\\u0119k',
      'Powr\\u00f3t do menu',
    ],
  },
  {
    relativePath: 'src/menu/CharadesSettingsOverlay.tsx',
    expectedPhrases: [
      'Urz\\u0105dzenie sterowania',
      'g\\u0142\\u00f3wny',
      'alternatywny',
      'Aktywne urz\\u0105dzenie',
      'Sta\\u0142y input klawiatury',
      'Przywr\\u00f3\\u0107 domy\\u015blne',
      'Zapisz i wyjd\\u017a',
      'Wr\\u00f3\\u0107 do ustawie\\u0144',
      'Przywr\\u00f3ci\\u0107 domy\\u015blne ustawienia?',
    ],
  },
]

const mojibakePattern = /\\u00c4\\u0085|\\u00c4\\u0082|\\u00c3\\u0084|\\u00c3\\u0085|\\u00c4\\u0082/

for (const { relativePath, expectedPhrases } of checks) {
  const absolutePath = path.resolve(__dirname, '..', relativePath)
  const content = fs.readFileSync(absolutePath, 'utf8')

  assert.ok(
    !mojibakePattern.test(content),
    `Expected clean UI copy without mojibake in ${relativePath}`,
  )

  for (const phrase of expectedPhrases) {
    assert.ok(
      content.includes(phrase),
      `Expected phrase "${phrase}" in ${relativePath}`,
    )
  }
}

console.log('ui-copy check passed')

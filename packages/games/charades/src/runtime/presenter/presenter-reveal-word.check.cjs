const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const targetPath = path.resolve(__dirname, './PresenterPhaseReveal.tsx')

const source = fs.readFileSync(targetPath, 'utf8')

assert.match(
  source,
  /export const PRESENTER_REVEAL_GLYPH_WIDTH = ([0-9.]+)/,
  'Presenter reveal should expose the glyph width heuristic used by AutoscaledWord',
)

const glyphWidth = Number(source.match(/export const PRESENTER_REVEAL_GLYPH_WIDTH = ([0-9.]+)/)?.[1] ?? NaN)

assert.ok(
  Number.isFinite(glyphWidth) && glyphWidth >= 0.62,
  `Presenter reveal glyph width heuristic is too optimistic (${glyphWidth}). Wide mobile words still overflow.`,
)

assert.match(
  source,
  /export function getRevealWordSizing\(word: string\)/,
  'Presenter reveal sizing helper should be exported for focused regression checks',
)

const singleWordShortBranch = source.match(
  /if \(wordCount <= 1\) \{[\s\S]*?if \(length <= \d+\) \{[\s\S]*?maxFontSize: (\d+)[\s\S]*?\}[\s\S]*?if \(length <= \d+\) \{[\s\S]*?maxFontSize: (\d+)/,
)

assert.ok(singleWordShortBranch, 'Expected explicit single-word sizing branches for short and medium reveal words')

const shortWordMax = Number(singleWordShortBranch[1])
const mediumWordMax = Number(singleWordShortBranch[2])

assert.ok(
  shortWordMax <= 132,
  `Single-word presenter reveal max font is too aggressive (${shortWordMax}). Short, wide words should cap lower on mobile.`,
)

assert.ok(
  mediumWordMax <= 104,
  `Medium single-word presenter reveal max font is too aggressive (${mediumWordMax}).`,
)

console.log('presenter reveal word sizing checks passed')

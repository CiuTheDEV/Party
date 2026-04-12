const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const path = require('node:path')
const ts = require('typescript')

const targetPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(__dirname, './autoscaled-word-layout.ts')

function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  })

  const localModule = new Module(filePath, module)
  localModule.filename = filePath
  localModule.paths = Module._nodeModulePaths(path.dirname(filePath))
  localModule._compile(transpiled.outputText, filePath)
  return localModule.exports
}

const layout = loadTsModule(targetPath)

const {
  tokenizeWords,
  buildLineText,
  generateWholeWordLineCandidates,
  estimateLayoutCandidate,
  chooseBestWholeWordLayout,
  resolveAutoscaledWordLayout,
  getLineBalancePenalty,
} = layout

assert.deepStrictEqual(tokenizeWords('  Nie   ma   tego złego  '), ['Nie', 'ma', 'tego', 'złego'])
assert.strictEqual(buildLineText(['Nie', 'ma']), 'Nie ma')

const candidates = generateWholeWordLineCandidates('Nie ma tego złego')

assert.ok(candidates.length > 0, 'expected at least one candidate')
assert.ok(candidates.every((candidate) => candidate.lines.length >= 1 && candidate.lines.length <= 3))
assert.ok(
  candidates.some((candidate) => candidate.lines.length === 2 && candidate.lines[0] === 'Nie ma' && candidate.lines[1] === 'tego złego'),
  'expected a two-line whole-word candidate',
)
assert.ok(
  candidates.every((candidate) =>
    candidate.lines.every((line) => line.split(' ').every((word) => word.length > 0)),
  ),
  'candidates should contain only whole words',
)

const overflowEstimate = estimateLayoutCandidate({
  candidate: { lines: ['Nie ma', 'tego złego'] },
  width: 120,
  height: 28,
  maxFontSize: 72,
  minFontSize: 18,
  lineHeight: 1.04,
  horizontalPadding: 0,
  verticalPadding: 0,
  averageGlyphWidth: 0.56,
})

assert.strictEqual(overflowEstimate.fits, false)

const chosen = chooseBestWholeWordLayout({
  text: 'Nie ma tego złego',
  width: 320,
  height: 160,
  maxFontSize: 72,
  minFontSize: 18,
  lineHeight: 1.04,
  horizontalPadding: 8,
  verticalPadding: 8,
  averageGlyphWidth: 0.56,
})

assert.ok(chosen, 'expected a chosen layout')
assert.ok(chosen.lines.length >= 1 && chosen.lines.length <= 3)
assert.ok(chosen.fits, 'chosen layout should fit')
assert.ok(chosen.fontSize >= 18, 'font should respect min size')
assert.ok(
  chosen.lines.every((line) => !line.includes('- ') && !line.endsWith('-')),
  'layout should not break words artificially',
)

const resolved = resolveAutoscaledWordLayout({
  text: 'Nie ma tego złego',
  strategy: 'whole-word',
  width: 320,
  height: 160,
  maxFontSize: 72,
  minFontSize: 18,
  lineHeight: 1.04,
  horizontalPadding: 8,
  verticalPadding: 8,
  averageGlyphWidth: 0.56,
})

assert.ok(Array.isArray(resolved.lines), 'resolved layout should expose explicit lines')
assert.ok(resolved.lines.length >= 1 && resolved.lines.length <= 3)
assert.ok(resolved.lines.every((line) => !line.includes('\n')), 'resolved lines should already be split')
assert.ok(resolved.lines.join(' ') === 'Nie ma tego złego', 'resolved layout should preserve whole words')
assert.ok(resolved.fontSize >= 18, 'resolved layout should keep the chosen font size')

const balancedThreeLine = chooseBestWholeWordLayout({
  text: 'Nie ma tego złego co by na dobre nie wyszło',
  width: 320,
  height: 220,
  maxFontSize: 64,
  minFontSize: 18,
  lineHeight: 1.04,
  horizontalPadding: 8,
  verticalPadding: 8,
  averageGlyphWidth: 0.56,
})

assert.ok(balancedThreeLine, 'expected a balanced three-line layout')
assert.notDeepStrictEqual(
  balancedThreeLine.lines,
  ['Nie ma', 'tego', 'złego co by na dobre nie wyszło'],
  'scoring should reject short-short-long three-line layouts when a more balanced option exists',
)

const shortShortLong = estimateLayoutCandidate({
  candidate: { lines: ['Ala', 'ma kota', 'który bardzo głośno mruczy'] },
  width: 280,
  height: 190,
  maxFontSize: 64,
  minFontSize: 18,
  lineHeight: 1.04,
  horizontalPadding: 8,
  verticalPadding: 8,
  averageGlyphWidth: 0.56,
})

const moreBalanced = estimateLayoutCandidate({
  candidate: { lines: ['Ala ma', 'kota który', 'bardzo głośno mruczy'] },
  width: 280,
  height: 190,
  maxFontSize: 64,
  minFontSize: 18,
  lineHeight: 1.04,
  horizontalPadding: 8,
  verticalPadding: 8,
  averageGlyphWidth: 0.56,
})

assert.ok(shortShortLong.fits, 'expected the short-short-long candidate to fit for comparison')
assert.ok(moreBalanced.fits, 'expected the balanced candidate to fit for comparison')
assert.ok(
  moreBalanced.score > shortShortLong.score,
  'balanced three-line layouts should score higher than short-short-long layouts',
)

const weakPenalty = getLineBalancePenalty(['Ala', 'ma kota', 'który bardzo głośno mruczy'])
const balancedPenalty = getLineBalancePenalty(['Ala ma kota', 'który bardzo', 'głośno mruczy'])

assert.ok(
  weakPenalty > balancedPenalty,
  'short-short-long layouts should receive a higher line-balance penalty than balanced layouts',
)

console.log('autoscaled-word-layout checks passed')

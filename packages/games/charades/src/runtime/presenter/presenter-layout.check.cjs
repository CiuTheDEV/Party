const fs = require('node:fs')
const path = require('node:path')

const cssPath = path.join(__dirname, 'PresenterPhaseReveal.module.css')
const css = fs.readFileSync(cssPath, 'utf8')

const wordRuleMatch = css.match(/\.word\s*\{([\s\S]*?)\}/)
const wordHeroMatch = css.match(/\.wordHero\s*\{([\s\S]*?)\}/)
const wordScaleRootMatch = css.match(/\.wordScaleRoot\s*\{([\s\S]*?)\}/)

if (!wordRuleMatch) {
  throw new Error('Missing .word rule in PresenterPhaseReveal.module.css')
}

if (!wordHeroMatch) {
  throw new Error('Missing .wordHero rule in PresenterPhaseReveal.module.css')
}

if (!wordScaleRootMatch) {
  throw new Error('Missing .wordScaleRoot rule in PresenterPhaseReveal.module.css')
}

const lineHeightMatch = wordRuleMatch[1].match(/line-height:\s*([0-9.]+)/)

if (!lineHeightMatch) {
  throw new Error('Missing line-height in presenter reveal word rule')
}

const lineHeight = Number(lineHeightMatch[1])

if (!Number.isFinite(lineHeight) || lineHeight < 1) {
  throw new Error(
    `Presenter reveal word line-height is too tight (${lineHeightMatch[1]}). Expected at least 1 to avoid clipping descenders and accented glyphs.`,
  )
}

const paddingBlockMatch = wordRuleMatch[1].match(/padding-block:\s*([^;]+);/)

if (!paddingBlockMatch) {
  throw new Error('Missing padding-block in presenter reveal word rule')
}

if (!/0\.(0*[1-9]|[1-9]\d*)em|[1-9]\d*px|[1-9]\d*rem/.test(paddingBlockMatch[1].trim())) {
  throw new Error(
    `Presenter reveal word padding-block is too small (${paddingBlockMatch[1].trim()}). Expected a positive vertical buffer to avoid clipping.`,
  )
}

if (/overflow-wrap:\s*anywhere/.test(wordRuleMatch[1])) {
  throw new Error('Presenter reveal word must not allow mid-word wrapping with overflow-wrap: anywhere')
}

if (!/min-height:\s*clamp\(/.test(wordHeroMatch[1])) {
  throw new Error('Presenter word stage should reserve a minimum clamp-based height for the text area')
}

if (!/height:\s*100%/.test(wordScaleRootMatch[1])) {
  throw new Error('Presenter word scale root should fill the available word stage height')
}

console.log(
  `Presenter reveal word layout OK: line-height ${lineHeight}, padding-block ${paddingBlockMatch[1].trim()}`,
)

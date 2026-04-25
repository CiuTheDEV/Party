const fs = require('node:fs')
const path = require('node:path')

const cssPath = path.join(__dirname, 'HostGameScreen.module.css')
const css = fs.readFileSync(cssPath, 'utf8')

function getRuleBody(selector) {
  const escapedSelector = selector.replace('.', '\\.')
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`))
  if (!match) {
    throw new Error(`Missing ${selector} rule in HostGameScreen.module.css`)
  }

  return match[1]
}

function hasDeclaration(ruleBody, property, valuePattern = '.+') {
  return new RegExp(`${property}\\s*:\\s*${valuePattern}\\s*;`).test(ruleBody)
}

const modalCardRule = getRuleBody('.modalCard')
const modalListRule = getRuleBody('.modalList')
const modalActionsRule = getRuleBody('.modalActions')

if (!hasDeclaration(modalCardRule, 'display', 'grid')) {
  throw new Error('Verdict picker modal card must use grid layout')
}

if (!hasDeclaration(modalCardRule, 'grid-template-rows', 'auto\\s+auto\\s+minmax\\(0,\\s*1fr\\)\\s+auto')) {
  throw new Error('Verdict picker modal card must reserve a final footer row for actions')
}

if (!hasDeclaration(modalCardRule, 'max-height', 'min\\([^;]+\\)')) {
  throw new Error('Verdict picker modal card must cap its height to the viewport')
}

if (!hasDeclaration(modalCardRule, 'padding', '.+')) {
  throw new Error('Verdict picker modal card must keep internal spacing around the picker content')
}

if (!hasDeclaration(modalListRule, 'overflow-y', 'auto')) {
  throw new Error('Verdict picker player list must scroll vertically when it overflows')
}

if (!hasDeclaration(modalListRule, 'min-height', '0')) {
  throw new Error('Verdict picker player list must allow shrinking inside the modal grid')
}

if (!hasDeclaration(modalListRule, 'align-content', 'start')) {
  throw new Error('Verdict picker player list should pack cards from the top before scrolling')
}

if (!hasDeclaration(modalActionsRule, 'display', 'flex')) {
  throw new Error('Verdict picker actions must stay grouped in a dedicated footer row')
}

if (!hasDeclaration(modalActionsRule, 'gap', '.+')) {
  throw new Error('Verdict picker footer actions must keep visible separation between buttons')
}

if (!hasDeclaration(modalActionsRule, 'transition', '.+')) {
  throw new Error('Verdict picker footer actions must keep their dedicated footer styling hook')
}

console.log('Verdict picker layout contract OK')

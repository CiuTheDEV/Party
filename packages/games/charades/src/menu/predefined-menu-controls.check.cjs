const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled predefined menu controls module path as first argument.')
}

const controlsModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('maps predefined keyboard menu inputs to semantic actions', () => {
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'ArrowLeft'), 'left')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Arrow Left'), 'left')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'ArrowRight'), 'right')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Arrow Right'), 'right')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'ArrowUp'), 'up')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Arrow Up'), 'up')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'ArrowDown'), 'down')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Arrow Down'), 'down')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Enter'), 'confirm')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Escape'), 'back')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Esc'), 'back')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Tab'), 'menu')
  assert.equal(controlsModule.resolvePredefinedMenuAction('keyboard', 'Space'), null)
})

run('maps predefined controller menu inputs to semantic actions', () => {
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'D-Pad Left'), 'left')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'L Stick Right'), 'right')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'D-Pad Up'), 'up')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'L Stick Down'), 'down')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'A / Cross'), 'confirm')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'B / Circle'), 'back')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'Start'), 'menu')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'Menu'), 'menu')
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'L1 / LB'), null)
  assert.equal(controlsModule.resolvePredefinedMenuAction('controller', 'R1 / RB'), null)
})

run('recognizes predefined previous or next shortcuts for tabs and device switchers', () => {
  assert.equal(controlsModule.resolvePredefinedMenuStep('keyboard', 'Q'), -1)
  assert.equal(controlsModule.resolvePredefinedMenuStep('keyboard', 'E'), 1)
  assert.equal(controlsModule.resolvePredefinedMenuStep('controller', 'L1 / LB'), -1)
  assert.equal(controlsModule.resolvePredefinedMenuStep('controller', 'R1 / RB'), 1)
  assert.equal(controlsModule.resolvePredefinedMenuStep('controller', 'A / Cross'), null)
})

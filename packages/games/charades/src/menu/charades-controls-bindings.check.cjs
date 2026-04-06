const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled controls bindings module path as first argument.')
}

const bindingsModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('creates primary and secondary defaults for each binding', () => {
  const defaults = bindingsModule.createDefaultBindings()

  assert.equal(defaults['keyboard-left:primary'], 'A')
  assert.equal(defaults['keyboard-left:secondary'], 'Arrow Left')
  assert.equal(defaults['keyboard-primary:primary'], 'Space')
  assert.equal(defaults['keyboard-primary:secondary'], '')
  assert.equal(defaults['controller-left:primary'], 'D-Pad Left')
  assert.equal(defaults['controller-left:secondary'], 'L Stick Left')
  assert.equal(defaults['controller-primary:primary'], 'R1 / RB')
  assert.equal(defaults['controller-primary:secondary'], '')
})

run('applies assignment to a specific slot and swaps conflicting slot values', () => {
  const binding = { id: 'keyboard-primary', device: 'keyboard' }
  const next = bindingsModule.applyBindingAssignment(
    {
      'keyboard-primary:primary': 'Space',
      'keyboard-primary:secondary': '',
      'keyboard-secondary:primary': 'Q',
      'keyboard-secondary:secondary': 'F',
    },
    binding,
    'secondary',
    'Q',
  )

  assert.equal(next['keyboard-primary:secondary'], 'Q')
  assert.equal(next['keyboard-secondary:primary'], '')
})

run('detects controller profile and formats mixed labels for display', () => {
  assert.equal(bindingsModule.detectGamepadProfile('Xbox Wireless Controller'), 'xbox')
  assert.equal(bindingsModule.detectGamepadProfile('Sony DualSense Wireless Controller'), 'playstation')
  assert.equal(bindingsModule.detectGamepadProfile('8BitDo Ultimate'), 'generic')

  assert.equal(bindingsModule.formatControllerLabelForProfile('A / Cross', 'xbox'), 'A')
  assert.equal(bindingsModule.formatControllerLabelForProfile('A / Cross', 'playstation'), 'Cross')
  assert.equal(bindingsModule.formatControllerLabelForProfile('L1 / LB', 'xbox'), 'LB')
  assert.equal(bindingsModule.formatControllerLabelForProfile('L1 / LB', 'playstation'), 'L1')
  assert.equal(bindingsModule.formatControllerLabelForProfile('L Stick Left', 'generic'), 'L Stick Left')
})

run('detects unsaved changes against the saved bindings snapshot', () => {
  const saved = bindingsModule.createDefaultBindings()
  const draft = {
    ...saved,
    'keyboard-left:secondary': 'J',
  }

  assert.equal(bindingsModule.hasBindingChanges(saved, saved), false)
  assert.equal(bindingsModule.hasBindingChanges(saved, draft), true)
  assert.equal(bindingsModule.hasBindingChanges(draft, saved), true)
})

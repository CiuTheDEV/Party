const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled host-controls module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

const bindings = {
  'keyboard-confirm:primary': 'Enter',
  'keyboard-confirm:secondary': '',
  'keyboard-menu:primary': 'Tab',
  'keyboard-menu:secondary': '',
  'keyboard-back:primary': 'Esc',
  'keyboard-back:secondary': '',
  'keyboard-rail:primary': 'R',
  'keyboard-rail:secondary': '',
  'controller-confirm:primary': 'A / Cross',
  'controller-confirm:secondary': '',
}

assert.equal(
  moduleUnderTest.getHostControlActionLabel(bindings, 'keyboard', 'rail'),
  'R',
)

assert.deepEqual(
  moduleUnderTest.resolveRuntimeCommand('codenames.runtime.reveal-selected-card', {
    boardSelectionIndex: 7,
    boardUnlocked: true,
    phase: 'playing',
    assassinFocusedTeam: 'red',
    canStartGame: false,
  }),
  { type: 'reveal-card', index: 7 },
)

assert.equal(
  moduleUnderTest.resolveRuntimeCommand('codenames.runtime.reveal-selected-card', {
    boardSelectionIndex: 7,
    boardUnlocked: false,
    phase: 'playing',
    assassinFocusedTeam: 'red',
    canStartGame: false,
  }),
  null,
)

assert.deepEqual(
  moduleUnderTest.resolveRuntimeCommand('codenames.runtime.confirm-assassin-team', {
    boardSelectionIndex: 7,
    boardUnlocked: true,
    phase: 'assassin-reveal',
    assassinFocusedTeam: 'blue',
    canStartGame: false,
  }),
  { type: 'confirm-assassin-team', team: 'blue' },
)

assert.deepEqual(
  moduleUnderTest.resolveRuntimeCommand('codenames.runtime.start-game', {
    boardSelectionIndex: 7,
    boardUnlocked: false,
    phase: 'waiting',
    assassinFocusedTeam: 'red',
    canStartGame: true,
  }),
  { type: 'start-game' },
)

const helpersModule = require(path.resolve(path.dirname(path.resolve(process.cwd(), builtModulePath)), 'runtime-input-helpers.js'))

assert.equal(
  helpersModule.resolveRuntimeHostAction(bindings, 'keyboard', 'Enter'),
  'confirm',
)

console.log('Codenames host-controls helpers behave as expected.')

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
  assert.equal(defaults['keyboard-confirm:primary'], 'Enter')
  assert.equal(defaults['keyboard-confirm:secondary'], '')
  assert.equal(defaults['keyboard-primary:primary'], undefined)
  assert.equal(defaults['keyboard-secondary:primary'], undefined)
  assert.equal(defaults['controller-left:primary'], 'D-Pad Left')
  assert.equal(defaults['controller-left:secondary'], 'L Stick Left')
  assert.equal(defaults['controller-confirm:primary'], 'A / Cross')
  assert.equal(defaults['controller-confirm:secondary'], '')
  assert.equal(defaults['controller-primary:primary'], undefined)
  assert.equal(defaults['controller-secondary:primary'], undefined)
})

run('applies assignment to a specific slot and swaps conflicting slot values', () => {
  const binding = { id: 'keyboard-confirm', device: 'keyboard' }
  const next = bindingsModule.applyBindingAssignment(
    {
      'keyboard-confirm:primary': 'Enter',
      'keyboard-confirm:secondary': '',
      'keyboard-back:primary': 'Q',
      'keyboard-back:secondary': 'Esc',
    },
    binding,
    'secondary',
    'Q',
  )

  assert.equal(next['keyboard-confirm:secondary'], 'Q')
  assert.equal(next['keyboard-back:primary'], '')
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

run('migrates legacy primary bindings into confirm slots when loading persisted data', () => {
  const store = new Map()

  global.window = {
    localStorage: {
      getItem(key) {
        return store.has(key) ? store.get(key) : null
      },
      setItem(key, value) {
        store.set(key, value)
      },
      removeItem(key) {
        store.delete(key)
      },
    },
  }

  store.set(
    bindingsModule.CHARADES_BINDINGS_STORAGE_KEY,
    JSON.stringify({
      'keyboard-primary:primary': 'F',
      'controller-primary:primary': 'R1 / RB',
    }),
  )

  const loaded = bindingsModule.loadPersistedBindings()
  assert.equal(loaded['keyboard-confirm:primary'], 'F')
  assert.equal(loaded['controller-confirm:primary'], 'R1 / RB')

  delete global.window
})

run('persists bindings and emits a same-tab update event', () => {
  const store = new Map()
  const dispatchedEvents = []

  global.CustomEvent = class CustomEventMock {
    constructor(type, init = {}) {
      this.type = type
      this.detail = init.detail
    }
  }

  global.window = {
    localStorage: {
      getItem(key) {
        return store.has(key) ? store.get(key) : null
      },
      setItem(key, value) {
        store.set(key, value)
      },
      removeItem(key) {
        store.delete(key)
      },
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event)
      return true
    },
  }

  const nextBindings = {
    ...bindingsModule.createDefaultBindings(),
    'keyboard-confirm:primary': 'F',
  }

  bindingsModule.persistBindings(nextBindings)

  assert.equal(
    store.get(bindingsModule.CHARADES_BINDINGS_STORAGE_KEY),
    JSON.stringify(nextBindings),
  )
  assert.equal(dispatchedEvents[0]?.type, bindingsModule.CHARADES_BINDINGS_UPDATED_EVENT)
  assert.deepEqual(dispatchedEvents[0]?.detail, nextBindings)

  delete global.window
  delete global.CustomEvent
})

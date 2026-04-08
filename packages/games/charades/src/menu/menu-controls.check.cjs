const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled menu controls module path as first argument.')
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

run('cycles menu mode focus between play and settings', () => {
  assert.equal(controlsModule.getNextMenuModeFocus('play', 'right'), 'play')
  assert.equal(controlsModule.getNextMenuModeFocus('play', 'left'), 'play')
  assert.equal(controlsModule.getNextMenuModeFocus('play', 'down'), 'play')
})

run('resolves menu mode commands from focus and semantic actions', () => {
  assert.deepEqual(controlsModule.resolveMenuModeCommand('play', 'confirm'), { type: 'open-setup' })
  assert.deepEqual(controlsModule.resolveMenuModeCommand('play', 'menu'), { type: 'open-settings' })
  assert.deepEqual(controlsModule.resolveMenuModeCommand('play', 'left'), { type: 'focus-rail' })
})

run('cycles settings tabs and controller device selectors', () => {
  assert.equal(controlsModule.getNextSettingsCategoryId('general', 'right'), 'audio')
  assert.equal(controlsModule.getNextSettingsCategoryId('controls', 'left'), 'audio')
  assert.equal(controlsModule.getNextControlsDevice('keyboard', 'right'), 'controller')
  assert.equal(controlsModule.getNextControlsDevice('controller', 'left'), 'keyboard')
})

run('resolves local tab navigation before falling back to rail handoff', () => {
  assert.deepEqual(
    controlsModule.resolveSettingsTabsCommand('audio', 'left'),
    { type: 'select-category', categoryId: 'general' },
  )
  assert.deepEqual(
    controlsModule.resolveSettingsTabsCommand('general', 'left'),
    { type: 'focus-rail' },
  )
  assert.deepEqual(
    controlsModule.resolveSettingsTabsCommand('audio', 'right'),
    { type: 'select-category', categoryId: 'controls' },
  )
  assert.equal(
    controlsModule.resolveSettingsTabsCommand('controls', 'right'),
    null,
  )
})

run('moves through visible settings bindings and footer actions', () => {
  assert.equal(
    controlsModule.getNextBindingFocusId(['keyboard-left', 'keyboard-right', 'keyboard-confirm'], 'keyboard-right', 'down'),
    'keyboard-confirm',
  )
  assert.equal(controlsModule.getNextFooterFocusId('reset', 'right'), 'save')
  assert.equal(
    controlsModule.getNextFooterFocusId('save', 'left'),
    'reset',
  )
})

run('moves between settings overlay focus areas based on active section type', () => {
  assert.equal(
    controlsModule.getNextSettingsFocusArea('tabs', 'down', { isControlsView: true }),
    'device',
  )
  assert.equal(
    controlsModule.getNextSettingsFocusArea('footer', 'up', { isControlsView: true }),
    'bindings',
  )
  assert.equal(
    controlsModule.getNextSettingsFocusArea('tabs', 'down', { isControlsView: false }),
    'footer',
  )
  assert.equal(
    controlsModule.getNextSettingsFocusArea('footer', 'up', { isControlsView: false }),
    'tabs',
  )
})

run('moves through rail links vertically', () => {
  assert.equal(
    controlsModule.getNextRailFocusHref(['/games/charades', '/games/charades/settings'], '/games/charades', 'down'),
    '/games/charades/settings',
  )
  assert.equal(
    controlsModule.getNextRailFocusHref(['/games/charades', '/games/charades/settings'], '/games/charades/settings', 'up'),
    '/games/charades',
  )
})

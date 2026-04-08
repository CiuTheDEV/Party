const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function read(relativePath) {
  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8')
}

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('GameSidebar exposes controlled focus visibility', () => {
  const source = read('../GameSidebar/GameSidebar.tsx')
  assert.match(source, /isFocusVisible\?: boolean/)
  assert.match(source, /isFocusVisible = true/)
  assert.match(source, /isFocusVisible && focusedHref === href/)
})

run('SettingsPanelTabs separates active and focused states', () => {
  const source = read('../SettingsPanelTabs/SettingsPanelTabs.tsx')
  assert.match(source, /focusedArrow\?: 'previous' \| 'next' \| null/)
  assert.match(source, /focusedTab\?: T \| null/)
  assert.match(source, /isFocusVisible\?: boolean/)
  assert.match(source, /styles\.tabFocused/)
  assert.match(source, /styles\.arrowButtonFocused/)
})

run('GameSetupTemplate can hide host focus visuals', () => {
  const source = read('../GameSetupTemplate/GameSetupTemplate.tsx')
  assert.match(source, /isFocusVisible = true/)
  assert.match(source, /isFocusVisible && focusedAction === 'close'/)
  assert.match(source, /isFocusVisible && focusedAction === 'start'/)
})

run('AlertDialog supports controlled default action focus', () => {
  const source = read('../AlertDialog/AlertDialog.tsx')
  assert.match(source, /focusedActionIndex\?: number \| null/)
  assert.match(source, /isFocusVisible\?: boolean/)
  assert.match(source, /focusedActionIndex === index/)
})

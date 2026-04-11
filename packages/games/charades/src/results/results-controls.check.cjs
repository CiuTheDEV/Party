const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled results controls module path as first argument.')
}

const resultsControlsModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('maps persisted keyboard and controller bindings for results actions', () => {
  const bindings = {
    'keyboard-left:primary': 'ArrowLeft',
    'keyboard-left:secondary': '',
    'controller-right:primary': 'D-Pad Right',
    'controller-right:secondary': '',
  }

  assert.equal(
    resultsControlsModule.resolveResultsAction(bindings, 'keyboard', 'ArrowLeft'),
    'left',
  )

  assert.equal(
    resultsControlsModule.resolveResultsAction(bindings, 'controller', 'D-Pad Right'),
    'right',
  )
})

run('moves result focus between play-again and menu actions', () => {
  assert.equal(
    resultsControlsModule.getNextResultsActionTarget('menu', 'left'),
    'again',
  )

  assert.equal(
    resultsControlsModule.getNextResultsActionTarget('again', 'right'),
    'menu',
  )

  assert.equal(
    resultsControlsModule.getNextResultsActionTarget('again', 'confirm'),
    'again',
  )
})

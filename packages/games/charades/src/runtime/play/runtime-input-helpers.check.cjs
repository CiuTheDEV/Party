const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled runtime input helpers module path as first argument.')
}

const runtimeInputHelpersModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('uses the persisted runtime bindings consistently for overlays and gameplay', () => {
  assert.equal(
    runtimeInputHelpersModule.resolveRuntimeHostAction(
      {
        isSettingsOpen: true,
        isVerdictPickerOpen: false,
      },
      {
        'keyboard-confirm:primary': 'F',
        'keyboard-confirm:secondary': '',
      },
      'keyboard',
      'F',
    ),
    'confirm',
  )

  assert.equal(
    runtimeInputHelpersModule.resolveRuntimeHostAction(
      {
        isSettingsOpen: false,
        isVerdictPickerOpen: false,
      },
      {
        'keyboard-confirm:primary': 'F',
        'keyboard-confirm:secondary': '',
      },
      'keyboard',
      'F',
    ),
    'confirm',
  )
})

run('does not treat initial controller snapshot as active input', () => {
  assert.equal(runtimeInputHelpersModule.shouldReportControllerDevice(null, null), false)
  assert.equal(runtimeInputHelpersModule.shouldReportControllerDevice({}, null), false)
  assert.equal(runtimeInputHelpersModule.shouldReportControllerDevice(null, 'A / Cross'), false)
  assert.equal(runtimeInputHelpersModule.shouldReportControllerDevice({}, 'A / Cross'), true)
})

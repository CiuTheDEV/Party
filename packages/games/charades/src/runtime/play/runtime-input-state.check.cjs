const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled runtime input state module path as first argument.')
}

const runtimeInputStateModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('first keyboard input only wakes sleeping runtime input', () => {
  const sleepingState = runtimeInputStateModule.createRuntimeInputState()
  const wokenState = runtimeInputStateModule.wakeRuntimeInput(sleepingState, 'keyboard')

  assert.equal(runtimeInputStateModule.shouldBlockRuntimeAction(sleepingState, 'keyboard'), true)
  assert.equal(wokenState.isAwake, true)
  assert.equal(wokenState.lastInputDevice, 'keyboard')
  assert.equal(wokenState.isControllerWakeGuardActive, false)
  assert.equal(runtimeInputStateModule.shouldBlockRuntimeAction(wokenState, 'keyboard'), false)
})

run('controller wake guard blocks actions until the pad returns neutral', () => {
  const sleepingState = runtimeInputStateModule.createRuntimeInputState()
  const wokenState = runtimeInputStateModule.wakeRuntimeInput(sleepingState, 'controller')

  assert.equal(runtimeInputStateModule.shouldBlockRuntimeAction(wokenState, 'controller'), true)

  const stillGuardedState = runtimeInputStateModule.updateRuntimeControllerWakeGuard(wokenState, false)
  assert.equal(stillGuardedState.isControllerWakeGuardActive, true)

  const releasedState = runtimeInputStateModule.updateRuntimeControllerWakeGuard(wokenState, true)
  assert.equal(releasedState.isControllerWakeGuardActive, false)
  assert.equal(runtimeInputStateModule.shouldBlockRuntimeAction(releasedState, 'controller'), false)
})

run('pointer sleep hides focus without forgetting the last device', () => {
  const awakeState = runtimeInputStateModule.wakeRuntimeInput(
    runtimeInputStateModule.createRuntimeInputState(),
    'keyboard',
  )
  const sleepingState = runtimeInputStateModule.sleepRuntimeInput(awakeState, 'mouse')

  assert.equal(sleepingState.isAwake, false)
  assert.equal(sleepingState.lastInputDevice, 'mouse')
  assert.equal(sleepingState.isControllerWakeGuardActive, false)
})

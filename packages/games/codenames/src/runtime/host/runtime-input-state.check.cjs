const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled runtime input state module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.createRuntimeInputState, 'function')
assert.equal(typeof moduleUnderTest.sleepRuntimeInput, 'function')
assert.equal(typeof moduleUnderTest.wakeRuntimeInput, 'function')
assert.equal(typeof moduleUnderTest.updateRuntimeControllerWakeGuard, 'function')
assert.equal(typeof moduleUnderTest.shouldBlockRuntimeAction, 'function')

const initial = moduleUnderTest.createRuntimeInputState()
assert.deepEqual(initial, {
  isAwake: false,
  lastInputDevice: null,
  isControllerWakeGuardActive: false,
})

const keyboardAwake = moduleUnderTest.wakeRuntimeInput(initial, 'keyboard')
assert.equal(moduleUnderTest.shouldBlockRuntimeAction(keyboardAwake, 'keyboard'), false)

const controllerAwake = moduleUnderTest.wakeRuntimeInput(initial, 'controller')
assert.equal(moduleUnderTest.shouldBlockRuntimeAction(controllerAwake, 'controller'), true)

const neutralController = moduleUnderTest.updateRuntimeControllerWakeGuard(controllerAwake, true)
assert.equal(moduleUnderTest.shouldBlockRuntimeAction(neutralController, 'controller'), false)

const sleptByMouse = moduleUnderTest.sleepRuntimeInput(neutralController, 'mouse')
assert.deepEqual(sleptByMouse, {
  isAwake: false,
  lastInputDevice: 'mouse',
  isControllerWakeGuardActive: false,
})

console.log('Codenames runtime input-state helpers behave as expected.')

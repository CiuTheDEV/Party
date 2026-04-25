const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.shouldKeepCaptainListenerActive, 'function')

assert.equal(
  moduleUnderTest.shouldKeepCaptainListenerActive({ hasRestoredSetup: false, roomId: 'alpha-room' }),
  false,
)

assert.equal(
  moduleUnderTest.shouldKeepCaptainListenerActive({ hasRestoredSetup: true, roomId: '' }),
  false,
)

assert.equal(
  moduleUnderTest.shouldKeepCaptainListenerActive({ hasRestoredSetup: true, roomId: 'alpha-room' }),
  true,
)

console.log('Captain listener activation helper behaves as expected.')

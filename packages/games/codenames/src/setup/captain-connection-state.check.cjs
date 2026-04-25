const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.getCaptainConnectionState, 'function')

assert.deepEqual(
  moduleUnderTest.getCaptainConnectionState({
    captainRedConnected: true,
    captainBlueConnected: false,
  }),
  {
    captainRedConnected: true,
    captainBlueConnected: false,
  },
)

assert.deepEqual(
  moduleUnderTest.getCaptainConnectionState({
    captainRedConnected: false,
    captainBlueConnected: true,
  }),
  {
    captainRedConnected: false,
    captainBlueConnected: true,
  },
)

console.log('Captain connection state helper behaves as expected.')

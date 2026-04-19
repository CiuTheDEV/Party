const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled start policy module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.canStartWaitingGame, 'function')
assert.equal(typeof moduleUnderTest.shouldAutoStartPendingRound, 'function')

assert.equal(
  moduleUnderTest.canStartWaitingGame({
    phase: 'waiting',
    captainRedConnected: true,
    captainBlueConnected: true,
  }),
  true,
)

assert.equal(
  moduleUnderTest.canStartWaitingGame({
    phase: 'waiting',
    captainRedConnected: true,
    captainBlueConnected: false,
  }),
  false,
)

assert.equal(
  moduleUnderTest.shouldAutoStartPendingRound({
    phase: 'waiting',
    captainRedConnected: true,
    captainBlueConnected: true,
  }),
  true,
)

assert.equal(
  moduleUnderTest.shouldAutoStartPendingRound({
    phase: 'playing',
    captainRedConnected: true,
    captainBlueConnected: true,
  }),
  false,
)

console.log('Codenames host start policy behaves as expected.')

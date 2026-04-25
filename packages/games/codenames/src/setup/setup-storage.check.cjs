const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled setup storage module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.restoreCodenamesSetupState, 'function')
assert.equal(typeof moduleUnderTest.serializeCodenamesSetupState, 'function')

const restored = moduleUnderTest.restoreCodenamesSetupState(
  JSON.stringify({
    roomId: 'ROOM1234',
    teams: [
      { name: 'Alfa', avatar: 'star' },
      { name: 'Beta', avatar: 'moon' },
    ],
    selectedCategories: { standard: true, adult: true },
    settings: {
      rounds: 5,
      assassins: {
        enabled: true,
        count: 4,
      },
    },
    categoryBalance: {
      leftCategoryId: 'standard',
      rightCategoryId: 'plus18',
      leftSharePercent: 60,
    },
    captainRedConnected: true,
    captainBlueConnected: true,
  }),
)

assert.deepEqual(restored.teams, [
  { name: 'Alfa', avatar: 'star' },
  { name: 'Beta', avatar: 'moon' },
])
assert.deepEqual(restored.selectedCategories, { standard: true })
assert.deepEqual(restored.settings, {
  rounds: 5,
  assassins: {
    enabled: true,
    count: 4,
  },
})
assert.equal(restored.categoryBalance, null)
assert.equal(restored.roomId, 'ROOM1234')
assert.equal(restored.captainRedConnected, false)
assert.equal(restored.captainBlueConnected, false)

const fallback = moduleUnderTest.restoreCodenamesSetupState('{"broken":true}')

assert.equal(typeof fallback.roomId, 'string')
assert.equal(fallback.roomId.length, 8)
assert.deepEqual(fallback.selectedCategories, { standard: true })
assert.deepEqual(fallback.settings, {
  rounds: 3,
  assassins: {
    enabled: false,
    count: 1,
  },
})
assert.equal(fallback.categoryBalance, null)

const serialized = moduleUnderTest.serializeCodenamesSetupState(restored)
const roundtrip = JSON.parse(serialized)

assert.equal(roundtrip.roomId, 'ROOM1234')
assert.deepEqual(roundtrip.teams, restored.teams)
assert.deepEqual(roundtrip.selectedCategories, restored.selectedCategories)
assert.deepEqual(roundtrip.settings, restored.settings)
assert.deepEqual(roundtrip.categoryBalance, restored.categoryBalance)
assert.equal(roundtrip.captainRedConnected, undefined)
assert.equal(roundtrip.captainBlueConnected, undefined)

console.log('Codenames setup storage helpers behave as expected.')

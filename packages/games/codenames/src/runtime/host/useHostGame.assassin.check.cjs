const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

function makeCards() {
  return [
    { word: 'alpha', color: 'assassin', revealed: false },
    { word: 'beta', color: 'neutral', revealed: false },
    { word: 'gamma', color: 'red', revealed: false },
    { word: 'delta', color: 'blue', revealed: false },
  ]
}

assert.equal(typeof moduleUnderTest.applyEvent, 'function')

const nextState = moduleUnderTest.applyEvent(
  {
    phase: 'assassin-reveal',
    cards: makeCards(),
    redTotal: 1,
    blueTotal: 1,
    roundWinsRed: 0,
    roundWinsBlue: 0,
    startingTeam: 'red',
    winner: null,
    assassinTeam: null,
    captainRedConnected: false,
    captainBlueConnected: false,
  },
  { type: 'ASSASSIN_TEAM', team: 'red' },
)

assert.equal(nextState.phase, 'ended')
assert.equal(nextState.winner, 'blue')
assert.equal(nextState.roundWinsRed, 0)
assert.equal(nextState.roundWinsBlue, 1)

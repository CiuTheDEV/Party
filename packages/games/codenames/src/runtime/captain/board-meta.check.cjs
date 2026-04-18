const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.getCaptainBoardMeta, 'function')

const meta = moduleUnderTest.getCaptainBoardMeta({
  phase: 'playing',
  cards: [
    { word: 'a', color: 'red', revealed: true },
    { word: 'b', color: 'red', revealed: false },
    { word: 'c', color: 'blue', revealed: false },
    { word: 'd', color: 'neutral', revealed: false },
  ],
  redTotal: 2,
  blueTotal: 1,
  roundWinsRed: 2,
  roundWinsBlue: 1,
  startingTeam: 'blue',
  winner: null,
  assassinTeam: null,
  captainRedConnected: true,
  captainBlueConnected: true,
})

assert.equal(meta.currentRound, 4)
assert.equal(meta.redRemaining, 1)
assert.equal(meta.blueRemaining, 1)
assert.equal(meta.startingTeam, 'blue')

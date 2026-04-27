const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.createPendingGameStartHistory, 'function')
assert.equal(typeof moduleUnderTest.commitPendingGameStartHistory, 'function')

const categories = [
  {
    id: 'plus18',
    words: Array.from({ length: 350 }, (_, index) => `plus18-${index}`),
  },
]

const cards = Array.from({ length: 25 }, (_, index) => ({
  word: `plus18-${index}`,
  color: index === 24 ? 'assassin' : 'red',
  revealed: false,
}))

const pending = moduleUnderTest.createPendingGameStartHistory({ cards })

const committed = moduleUnderTest.commitPendingGameStartHistory({
  pending,
  categories,
  cards,
  history: { pools: {} },
})

assert.equal(committed.pools.plus18.usedWords.length, 25)

const mismatch = moduleUnderTest.commitPendingGameStartHistory({
  pending,
  categories,
  cards: cards.map((card, index) => (index === 0 ? { ...card, word: 'other-word' } : card)),
  history: { pools: {} },
})

assert.deepEqual(mismatch, { pools: {} })

console.log('ok - game start history commits only after the confirmed board matches')

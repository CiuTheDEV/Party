const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled start-game module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.prepareCodenamesGameStart, 'function')

const blocked = moduleUnderTest.prepareCodenamesGameStart({
  categories: [
    {
      id: 'standard',
      words: Array.from({ length: 24 }, (_, index) => `word-${index}`),
    },
  ],
  history: { pools: {} },
})

assert.deepEqual(blocked, {
  ok: false,
  reason: 'Aktywna pula ma mniej niz 25 swiezych hasel. Zresetuj pule przed kolejna plansza.',
})

const started = moduleUnderTest.prepareCodenamesGameStart({
  categories: [
    {
      id: 'standard',
      words: Array.from({ length: 20 }, (_, index) => `standard-${index}`),
    },
    {
      id: 'adult',
      words: Array.from({ length: 20 }, (_, index) => `adult-${index}`),
    },
  ],
  history: { pools: {} },
})

assert.equal(started.ok, true)
assert.equal(started.board.cards.length, 25)
assert.ok(started.history.pools.standard.usedWords.length > 0)
assert.ok(started.history.pools.adult.usedWords.length > 0)
assert.equal(started.history.pools.adult.usedWords.length + started.history.pools.standard.usedWords.length, 25)

console.log('Codenames host start helper behaves as expected.')

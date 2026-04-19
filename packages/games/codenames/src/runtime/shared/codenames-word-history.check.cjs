const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled word history module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.buildCodenamesPoolKey, 'function')
assert.equal(typeof moduleUnderTest.getFreshWordsForCategories, 'function')
assert.equal(typeof moduleUnderTest.getFreshWordsForPool, 'function')
assert.equal(typeof moduleUnderTest.recordUsedWordsForCategories, 'function')
assert.equal(typeof moduleUnderTest.recordUsedWordsForPool, 'function')
assert.equal(typeof moduleUnderTest.resetCodenamesCategoryHistories, 'function')
assert.equal(typeof moduleUnderTest.resetCodenamesPoolHistory, 'function')

const poolKey = moduleUnderTest.buildCodenamesPoolKey({ adult: true, standard: true })
assert.equal(poolKey, 'adult|standard')

const history = {
  pools: {
    standard: {
      usedWords: ['atlas', 'berlin', 'atlas'],
      lastUpdatedAt: 100,
    },
    adult: {
      usedWords: ['delta'],
      lastUpdatedAt: 110,
    },
  },
}

assert.deepEqual(
  moduleUnderTest.getFreshWordsForPool({
    wordPool: ['atlas', 'berlin', 'cytryna'],
    history,
    poolKey: 'standard',
  }),
  ['cytryna'],
)

assert.deepEqual(
  moduleUnderTest.getFreshWordsForCategories({
    categories: [
      { id: 'standard', words: ['atlas', 'berlin', 'cytryna'] },
      { id: 'adult', words: ['delta', 'echo'] },
    ],
    history,
  }),
  ['cytryna', 'echo'],
)

const recorded = moduleUnderTest.recordUsedWordsForCategories({
  history,
  categories: [
    { id: 'standard', words: ['atlas', 'berlin', 'cytryna'] },
    { id: 'adult', words: ['delta', 'echo'] },
  ],
  usedWords: ['cytryna', 'delta', 'echo'],
  now: () => 200,
})

assert.deepEqual(recorded.pools.standard.usedWords, ['atlas', 'berlin', 'cytryna'])
assert.deepEqual(recorded.pools.adult.usedWords, ['delta', 'echo'])
assert.equal(recorded.pools.standard.lastUpdatedAt, 200)
assert.equal(recorded.pools.adult.lastUpdatedAt, 200)

const reset = moduleUnderTest.resetCodenamesCategoryHistories({
  history: recorded,
  categoryIds: ['adult'],
  now: () => 300,
})

assert.deepEqual(reset.pools.standard.usedWords, ['atlas', 'berlin', 'cytryna'])
assert.deepEqual(reset.pools.adult.usedWords, [])
assert.equal(reset.pools.adult.lastUpdatedAt, 300)

console.log('Codenames word history helpers behave as expected.')

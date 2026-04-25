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
  reason: 'Aktywna pula ma mniej niż 25 świeżych haseł. Zresetuj pulę przed kolejną planszą.',
})

const started = moduleUnderTest.prepareCodenamesGameStart({
  categories: [
    {
      id: 'standard',
      words: Array.from({ length: 100 }, (_, index) => `standard-${index}`),
    },
    {
      id: 'adult',
      words: Array.from({ length: 100 }, (_, index) => `adult-${index}`),
    },
  ],
  history: { pools: {} },
  categoryBalance: {
    leftCategoryId: 'standard',
    rightCategoryId: 'adult',
    leftSharePercent: 80,
  },
})

assert.equal(started.ok, true)
assert.equal(started.board.cards.length, 25)
assert.equal(started.board.cards.filter((card) => card.word.startsWith('standard-')).length, 20)
assert.equal(started.board.cards.filter((card) => card.word.startsWith('adult-')).length, 5)
assert.equal(started.history.pools.standard.usedWords.length, 20)
assert.equal(started.history.pools.adult.usedWords.length, 5)

const blockedByBalance = moduleUnderTest.prepareCodenamesGameStart({
  categories: [
    {
      id: 'standard',
      words: Array.from({ length: 100 }, (_, index) => `standard-${index}`),
    },
    {
      id: 'adult',
      words: Array.from({ length: 4 }, (_, index) => `adult-${index}`),
    },
  ],
  history: { pools: {} },
  categoryBalance: {
    leftCategoryId: 'standard',
    rightCategoryId: 'adult',
    leftSharePercent: 80,
  },
})

assert.deepEqual(blockedByBalance, {
  ok: false,
  reason: 'Wybrany balans planszy wymaga większej liczby świeżych haseł w jednej z kategorii.',
})

const blockedBySameCategoryBalance = moduleUnderTest.prepareCodenamesGameStart({
  categories: [
    {
      id: 'standard',
      words: Array.from({ length: 100 }, (_, index) => `standard-${index}`),
    },
    {
      id: 'adult',
      words: Array.from({ length: 100 }, (_, index) => `adult-${index}`),
    },
  ],
  history: { pools: {} },
  categoryBalance: {
    leftCategoryId: 'standard',
    rightCategoryId: 'standard',
    leftSharePercent: 50,
  },
})

assert.deepEqual(blockedBySameCategoryBalance, {
  ok: false,
  reason: 'Wybrany balans planszy nie pasuje do aktywnych kategorii.',
})

const blockedByStaleBalance = moduleUnderTest.prepareCodenamesGameStart({
  categories: [
    {
      id: 'standard',
      words: Array.from({ length: 100 }, (_, index) => `standard-${index}`),
    },
    {
      id: 'adult',
      words: Array.from({ length: 100 }, (_, index) => `adult-${index}`),
    },
  ],
  history: { pools: {} },
  categoryBalance: {
    leftCategoryId: 'standard',
    rightCategoryId: 'plus18',
    leftSharePercent: 50,
  },
})

assert.deepEqual(blockedByStaleBalance, {
  ok: false,
  reason: 'Wybrany balans planszy nie pasuje do aktywnych kategorii.',
})

console.log('Codenames host start helper behaves as expected.')

const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled pool validation module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.getCodenamesPoolSummary, 'function')
assert.equal(typeof moduleUnderTest.getCodenamesCategoryPoolSummaries, 'function')
assert.equal(typeof moduleUnderTest.appendPoolValidationError, 'function')

const categories = [
  { id: 'standard', name: 'Standardowe', description: '', words: ['a', 'b', 'c'] },
  { id: 'adult', name: '+18', description: '', words: ['d', 'e'] },
]

const summary = moduleUnderTest.getCodenamesPoolSummary({
  categories,
  selectedCategories: { standard: true, adult: true },
  history: {
    pools: {
      standard: {
        usedWords: ['a', 'b', 'c'],
        lastUpdatedAt: 1,
      },
      adult: {
        usedWords: ['d'],
        lastUpdatedAt: 2,
      },
    },
  },
})

assert.deepEqual(summary, {
  poolKey: 'adult|standard',
  total: 5,
  remaining: 1,
  isExhausted: true,
})

const categorySummaries = moduleUnderTest.getCodenamesCategoryPoolSummaries({
  categories,
  selectedCategories: { standard: true, adult: true },
  history: {
    pools: {
      standard: {
        usedWords: ['a', 'b', 'c'],
        lastUpdatedAt: 1,
      },
      adult: {
        usedWords: ['d'],
        lastUpdatedAt: 2,
      },
    },
  },
})

assert.deepEqual(categorySummaries, [
  {
    categoryId: 'standard',
    name: 'Standardowe',
    total: 3,
    remaining: 0,
    isExhausted: true,
    isSelected: true,
  },
  {
    categoryId: 'adult',
    name: '+18',
    total: 2,
    remaining: 1,
    isExhausted: true,
    isSelected: true,
  },
])

const validation = moduleUnderTest.appendPoolValidationError({
  errors: ['Polacz obu kapitanow przed startem gry.'],
  summary,
  minWordsRequired: 25,
})

assert.deepEqual(validation, [
  'Polacz obu kapitanow przed startem gry.',
  'Aktywna pula ma mniej niz 25 swiezych hasel. Zresetuj pule przed startem gry.',
])

console.log('Codenames setup pool validation behaves as expected.')

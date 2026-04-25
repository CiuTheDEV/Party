const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled category balance module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.hasExactlyTwoSelectedCategories, 'function')
assert.equal(typeof moduleUnderTest.getBalancedCategoryIds, 'function')
assert.equal(typeof moduleUnderTest.resolveBoardSplit, 'function')

assert.equal(moduleUnderTest.hasExactlyTwoSelectedCategories({ standard: true, plus18: true }), true)
assert.equal(moduleUnderTest.hasExactlyTwoSelectedCategories({ standard: true }), false)
assert.equal(moduleUnderTest.hasExactlyTwoSelectedCategories({ standard: true, plus18: true, extra: true }), true)

assert.deepEqual(moduleUnderTest.getBalancedCategoryIds({ plus18: true, standard: true }), ['plus18', 'standard'])
assert.equal(moduleUnderTest.getBalancedCategoryIds({ standard: true }), null)
assert.deepEqual(moduleUnderTest.getBalancedCategoryIds({ standard: true, plus18: true, extra: true }), ['plus18', 'standard'])

assert.deepEqual(
  moduleUnderTest.resolveBoardSplit({
    leftCategoryId: 'plus18',
    rightCategoryId: 'standard',
    leftSharePercent: 50,
  }),
  { leftCount: 13, rightCount: 12 },
)

assert.deepEqual(
  moduleUnderTest.resolveBoardSplit({
    leftCategoryId: 'plus18',
    rightCategoryId: 'standard',
    leftSharePercent: 80,
  }),
  { leftCount: 20, rightCount: 5 },
)

assert.deepEqual(
  moduleUnderTest.resolveBoardSplit({
    leftCategoryId: 'plus18',
    rightCategoryId: 'standard',
    leftSharePercent: -20,
  }),
  { leftCount: 0, rightCount: 25 },
)

assert.deepEqual(
  moduleUnderTest.resolveBoardSplit({
    leftCategoryId: 'plus18',
    rightCategoryId: 'standard',
    leftSharePercent: 120,
  }),
  { leftCount: 25, rightCount: 0 },
)

assert.deepEqual(
  moduleUnderTest.resolveBoardSplit({
    leftCategoryId: 'plus18',
    rightCategoryId: 'standard',
    leftSharePercent: Number.NaN,
  }),
  { leftCount: 13, rightCount: 12 },
)

console.log('Codenames category balance helpers behave as expected.')

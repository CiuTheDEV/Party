const assert = require('node:assert/strict')

const modulePath = process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled playboard state helpers module path as first argument.')
}

const { getCornerDeckCountDuringDeal } = require(modulePath)

function run(name, fn) {
  try {
    fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

run('removes the flying card from the corner stack immediately', () => {
  assert.equal(getCornerDeckCountDuringDeal(4, 0), 3)
  assert.equal(getCornerDeckCountDuringDeal(4, 2), 1)
  assert.equal(getCornerDeckCountDuringDeal(4, 3), 0)
})

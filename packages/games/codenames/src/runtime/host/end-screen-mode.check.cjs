const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.getHostEndScreenMode, 'function')

assert.equal(
  moduleUnderTest.getHostEndScreenMode({
    roundWinsRed: 1,
    roundWinsBlue: 0,
    roundsToWin: 3,
  }),
  'round',
)

assert.equal(
  moduleUnderTest.getHostEndScreenMode({
    roundWinsRed: 1,
    roundWinsBlue: 3,
    roundsToWin: 3,
  }),
  'match',
)

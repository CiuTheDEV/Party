const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(moduleUnderTest.getCaptainScreenMode({ phase: 'waiting', cards: [] }), 'waiting')
assert.equal(
  moduleUnderTest.getCaptainScreenMode({
    phase: 'playing',
    cards: [{ word: 'x', color: 'red', revealed: false }],
  }),
  'board',
)

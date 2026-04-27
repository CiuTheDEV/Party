const assert = require('node:assert/strict')
const path = require('node:path')

const modulePath = process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled module path as the first argument.')
}

const { shouldAutoStartAfterMatchReset } = require(path.resolve(modulePath))

assert.equal(shouldAutoStartAfterMatchReset('rematch'), true)
assert.equal(shouldAutoStartAfterMatchReset('exit-to-menu'), false)

console.log('ok - rematch keeps auto start, exit-to-menu does not')

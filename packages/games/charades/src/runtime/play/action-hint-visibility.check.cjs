const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled action hint visibility module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('hides action hint labels while input is asleep', () => {
  assert.equal(moduleUnderTest.getVisibleActionHintLabel('Enter', false), null)
})

run('keeps action hint labels visible while input is awake', () => {
  assert.equal(moduleUnderTest.getVisibleActionHintLabel('Enter', true), 'Enter')
})

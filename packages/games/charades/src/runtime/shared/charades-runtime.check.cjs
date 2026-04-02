const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled runtime module path as first argument.')
}

const runtimeModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('uses explicit env host when provided', () => {
  assert.equal(
    runtimeModule.resolvePartykitHost({
      envHost: 'partykit.example.com',
      windowHostname: 'party.example.com',
    }),
    'partykit.example.com',
  )
})

run('allows localhost fallback in local development', () => {
  assert.equal(
    runtimeModule.resolvePartykitHost({
      envHost: '',
      windowHostname: 'localhost',
    }),
    'localhost:1999',
  )
})

run('rejects production hostname without explicit PartyKit host', () => {
  assert.throws(
    () =>
      runtimeModule.resolvePartykitHost({
        envHost: '',
        windowHostname: 'party.example.com',
      }),
    /NEXT_PUBLIC_PARTYKIT_HOST/,
  )
})

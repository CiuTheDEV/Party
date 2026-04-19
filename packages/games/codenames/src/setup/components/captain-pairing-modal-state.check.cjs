const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled captain pairing modal state module path as first argument.')
}

const stateModule = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(stateModule.shouldAutoCloseCaptainPairingModal(false, false), false)
assert.equal(stateModule.shouldAutoCloseCaptainPairingModal(true, false), false)
assert.equal(stateModule.shouldAutoCloseCaptainPairingModal(false, true), false)
assert.equal(stateModule.shouldAutoCloseCaptainPairingModal(true, true), true)

assert.equal(stateModule.getCaptainPairingSummary(false, false), 'Czekam na połączenie obu kapitanów.')
assert.equal(
  stateModule.getCaptainPairingSummary(true, false),
  'Kapitan Czerwonych już się połączył. Czekam na Kapitana Niebieskich.',
)
assert.equal(
  stateModule.getCaptainPairingSummary(false, true),
  'Kapitan Niebieskich już się połączył. Czekam na Kapitana Czerwonych.',
)
assert.equal(
  stateModule.getCaptainPairingSummary(true, true),
  'Obaj kapitanowie są już połączeni. Zamykam parowanie.',
)

console.log('Captain pairing modal state helpers behave as expected.')

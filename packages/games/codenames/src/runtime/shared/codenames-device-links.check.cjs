const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled Codenames runtime module path as first argument.')
}

const runtimeModule = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(runtimeModule.buildCaptainPath('866B72DD'), '/games/codenames/captain/866B72DD')
assert.equal(runtimeModule.buildCaptainPath('866B72DD', 'red'), '/games/codenames/captain/866B72DD?team=red')
assert.equal(
  runtimeModule.buildCaptainUrl('https://party-9pe.pages.dev', '866B72DD'),
  'https://party-9pe.pages.dev/games/codenames/captain/866B72DD',
)

console.log('Codenames captain links use the short path format.')

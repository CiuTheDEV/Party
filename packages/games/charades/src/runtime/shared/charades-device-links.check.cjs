const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled Charades runtime module path as first argument.')
}

const runtimeModule = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(runtimeModule.buildPresenterPath('866B72DD'), '/games/charades/present/866B72DD')
assert.equal(
  runtimeModule.buildPresenterUrl('https://party-9pe.pages.dev', '866B72DD'),
  'https://party-9pe.pages.dev/games/charades/present/866B72DD',
)
assert.equal(
  runtimeModule.buildPresenterUrl('https://party-9pe.pages.dev/', '866B72DD'),
  'https://party-9pe.pages.dev/games/charades/present/866B72DD',
)

console.log('Charades presenter links use the short path format.')

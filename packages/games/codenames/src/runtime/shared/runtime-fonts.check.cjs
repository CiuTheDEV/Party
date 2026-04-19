const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const hostCss = fs.readFileSync(path.join(root, 'host', 'BoardGrid.module.css'), 'utf8')
const captainCss = fs.readFileSync(path.join(root, 'captain', 'CaptainGrid.module.css'), 'utf8')

assert.ok(
  hostCss.includes('font: inherit;'),
  'expected host board buttons to inherit the runtime font',
)

assert.ok(
  hostCss.includes('font-family: inherit;'),
  'expected host card faces to keep the shared runtime font family',
)

assert.ok(
  captainCss.includes('font-family: inherit;'),
  'expected captain card faces to keep the shared runtime font family',
)

console.log('codenames runtime font check passed')

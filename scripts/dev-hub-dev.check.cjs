const fs = require('node:fs')
const path = require('node:path')

const scriptPath = path.resolve(__dirname, 'dev-hub-dev.mjs')
const source = fs.readFileSync(scriptPath, 'utf8')

if (!source.includes("'next'") || !source.includes("'dist'") || !source.includes("'bin'")) {
  throw new Error('dev-hub-dev.mjs should invoke the Next.js CLI so local static dev rebuilds apps/hub/out before serving it.')
}

if (!source.includes("'build'")) {
  throw new Error('dev-hub-dev.mjs should run `next build` before starting the static hub server.')
}

console.log('dev-hub-dev script rebuilds the hub before serving static output.')

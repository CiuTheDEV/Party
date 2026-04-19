import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const outputDir = path.join(repoRoot, 'output')
const authEntry = path.join(scriptDir, 'dev-auth-server.entry.ts')
const authBundleDir = path.join(outputDir, 'dev-auth-server')
const authBundle = path.join(authBundleDir, 'scripts', 'dev-auth-server.entry.js')

function spawnProcess(command, args, options) {
  return spawn(command, args, {
    stdio: 'inherit',
    ...options,
  })
}

function waitForProcessExit(child, label) {
  return new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${label} exited with signal ${signal}`))
        return
      }

      if ((code ?? 0) !== 0) {
        reject(new Error(`${label} exited with code ${code}`))
        return
      }

      resolve(undefined)
    })
  })
}

async function main() {
  const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc')

  const tscProcess = spawnProcess(process.execPath, [
    tscBin,
    authEntry,
    '--outDir',
    authBundleDir,
    '--rootDir',
    '.',
    '--module',
    'commonjs',
    '--moduleResolution',
    'node',
    '--target',
    'es2022',
    '--lib',
    'es2022,dom',
    '--types',
    'node',
    '--skipLibCheck',
    '--esModuleInterop',
  ], {
    cwd: repoRoot,
  })

  await waitForProcessExit(tscProcess, 'tsc')

  const authProcess = spawnProcess(process.execPath, [authBundle], {
    cwd: repoRoot,
    env: {
      ...process.env,
      AUTH_API_PORT: '8788',
      AUTH_API_DB_PATH: path.join('output', 'local-auth-db.json'),
    },
  })

  authProcess.once('exit', (code, signal) => {
    if (signal) {
      console.error(`[dev-auth] exited with signal ${signal}`)
      process.exit(1)
    }

    process.exit(code ?? 0)
  })

  process.on('SIGINT', () => authProcess.kill())
  process.on('SIGTERM', () => authProcess.kill())
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

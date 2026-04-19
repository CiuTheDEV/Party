import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const hubDir = path.join(repoRoot, 'apps', 'hub')
const hubOutDir = path.join(hubDir, 'out')
const outputDir = path.join(repoRoot, 'output')
const authEntry = path.join(scriptDir, 'dev-auth-server.entry.ts')
const authBundleDir = path.join(outputDir, 'dev-auth-server')
const authBundle = path.join(authBundleDir, 'scripts', 'dev-auth-server.entry.js')
const authDbPath = path.join('output', 'local-auth-db.json')
const authPort = 8788

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

function waitForPort(port, host = '127.0.0.1', timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()

    const attempt = () => {
      const socket = net.connect(port, host)

      socket.once('connect', () => {
        socket.end()
        resolve(undefined)
      })

      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`))
          return
        }

        setTimeout(attempt, 150)
      })
    }

    attempt()
  })
}

function attachExitSignal(child, name) {
  child.once('exit', (code, signal) => {
    if (signal) {
      console.error(`[dev-hub] ${name} exited with signal ${signal}`)
      shutdown(1)
      return
    }

    if ((code ?? 0) !== 0) {
      console.error(`[dev-hub] ${name} exited with code ${code}`)
      shutdown(code ?? 1)
      return
    }

    shutdown(0)
  })
}

let authProcess = null
let staticServer = null

function shutdown(code) {
  authProcess?.kill()
  staticServer?.close()
  process.exit(code)
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()

  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.ico':
      return 'image/x-icon'
    case '.woff':
      return 'font/woff'
    case '.woff2':
      return 'font/woff2'
    default:
      return 'application/octet-stream'
  }
}

function rewriteHubUrl(url) {
  const charadesMatch = url.pathname.match(/^\/games\/charades\/present\/([^/]+)\/?$/)

  if (charadesMatch) {
    const nextUrl = new URL(url.toString())
    nextUrl.pathname = '/games/charades/present/'
    nextUrl.searchParams.set('room', decodeURIComponent(charadesMatch[1]))
    return nextUrl
  }

  const codenamesMatch = url.pathname.match(/^\/games\/codenames\/captain\/([^/]+)\/?$/)

  if (codenamesMatch) {
    const nextUrl = new URL(url.toString())
    nextUrl.pathname = '/games/codenames/captain/'
    nextUrl.searchParams.set('room', decodeURIComponent(codenamesMatch[1]))
    return nextUrl
  }

  return url
}

async function resolveStaticFile(requestPath) {
  const cleanPath = decodeURIComponent(requestPath).replace(/\\/g, '/')
  const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  const candidates = []

  if (normalized === '/') {
    candidates.push(path.join(hubOutDir, 'index.html'))
  } else {
    candidates.push(path.join(hubOutDir, normalized))
    candidates.push(path.join(hubOutDir, `${normalized}.html`))
    candidates.push(path.join(hubOutDir, normalized, 'index.html'))
  }

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    if (!resolved.startsWith(path.resolve(hubOutDir))) {
      continue
    }

    try {
      const text = await readFile(resolved)
      return { path: resolved, body: text }
    } catch {
      // Try the next candidate.
    }
  }

  return null
}

async function startStaticServer() {
  await mkdir(hubOutDir, { recursive: true })

  staticServer = createServer(async (request, response) => {
    try {
      const url = rewriteHubUrl(new URL(request.url ?? '/', 'http://127.0.0.1:3000'))
      const file = await resolveStaticFile(url.pathname)

      if (!file) {
        response.statusCode = 404
        response.setHeader('content-type', 'text/plain; charset=utf-8')
        response.end('Not found')
        return
      }

      response.statusCode = 200
      response.setHeader('content-type', mimeTypeFor(file.path))
      response.end(file.body)
    } catch (error) {
      response.statusCode = 500
      response.setHeader('content-type', 'text/plain; charset=utf-8')
      response.end(error instanceof Error ? error.message : 'Internal error')
    }
  })

  await new Promise((resolve, reject) => {
    staticServer.once('error', reject)
    staticServer.listen(3000, '127.0.0.1', () => {
      console.log('[dev-hub] static hub listening on http://127.0.0.1:3000')
      resolve(undefined)
    })
  })
}

async function main() {
  const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc')
  const nextBin = path.join(repoRoot, 'node_modules', 'next', 'dist', 'bin', 'next')

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

  await new Promise((resolve, reject) => {
    void waitForProcessExit(tscProcess, 'tsc').then(resolve, reject)
  })

  const nextBuildProcess = spawnProcess(process.execPath, [nextBin, 'build'], {
    cwd: hubDir,
    env: process.env,
  })

  await new Promise((resolve, reject) => {
    void waitForProcessExit(nextBuildProcess, 'next build').then(resolve, reject)
  })

  authProcess = spawnProcess(process.execPath, [authBundle], {
    cwd: repoRoot,
    env: {
      ...process.env,
      AUTH_API_PORT: String(authPort),
      AUTH_API_DB_PATH: authDbPath,
    },
  })
  attachExitSignal(authProcess, 'auth api')

  await waitForPort(authPort)

  await startStaticServer()

  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

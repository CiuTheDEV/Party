import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  buildSessionCookie,
  clearSessionCookie,
  readCookieValue,
} from '../apps/hub/src/lib/auth/auth-domain'
import {
  createActivationCode as createActivationCodeRecord,
  getCurrentUser,
  loginAccount,
  logoutAccount,
  redeemActivationCode,
  registerAccount,
  updateAvatar,
  type ActivationCodeRecord,
  type AuthRepository,
  type AuthSessionRecord,
  type AuthUserRecord,
} from '../apps/hub/src/lib/auth/auth-service'

type LocalAuthState = {
  users: AuthUserRecord[]
  sessions: AuthSessionRecord[]
  activationCodes: ActivationCodeRecord[]
}

type AuthFailure = {
  code: string
  message: string
  status: number
}

const MANUAL_GRANT_CODE_PREFIX = 'ADMIN-GRANT-'
const MANUAL_GRANT_EXPIRES_AT = '9999-12-31T23:59:59.000Z'
const DEFAULT_ENTITLEMENT_KEY = 'charades_category_pack'
const DEFAULT_PORT = 8788
const DEFAULT_DATA_FILE = 'output/local-auth-db.json'
const seededActivationCode: ActivationCodeRecord = {
  id: 'activation-charades-pack',
  code: 'KALAMBURY-START',
  entitlementKey: DEFAULT_ENTITLEMENT_KEY,
  createdAt: '2026-04-12T00:00:00.000Z',
  codeExpiresAt: null,
  unlockDurationMinutes: 60,
  redeemedByUserId: null,
  redeemedAt: null,
  expiresAt: null,
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  })
}

function errorResponse(message: string, status = 400, code = 'invalid_input') {
  return jsonResponse({ error: { code, message, status } }, { status })
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) {
    return {}
  }

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
    vary: 'origin',
  }
}

function withCorsHeaders(request: Request, response: Response) {
  const headers = new Headers(response.headers)
  const corsHeaders = getCorsHeaders(request)

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value)
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function isAuthFailure(
  result:
    | { ok: true }
    | { ok: false; error: AuthFailure },
): result is { ok: false; error: AuthFailure } {
  return result.ok === false
}

async function readJsonBody<T extends Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

function toStringField(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSearchQuery(value: string | null) {
  return value?.trim() ?? ''
}

function normalizeEntitlementKey(value: unknown) {
  const key = toStringField(value)
  return key || DEFAULT_ENTITLEMENT_KEY
}

function isManualGrantCode(code: string) {
  return code.startsWith(MANUAL_GRANT_CODE_PREFIX)
}

function mapActivationCode(row: ActivationCodeRecord) {
  const isActive = row.redeemedAt !== null && row.expiresAt !== null && new Date(row.expiresAt).getTime() > Date.now()
  const status = isActive
    ? 'active'
    : row.redeemedAt
      ? 'expired'
      : row.codeExpiresAt && new Date(row.codeExpiresAt).getTime() <= Date.now()
        ? 'expired'
        : 'pending'

  return {
    id: row.id,
    code: row.code,
    entitlementKey: row.entitlementKey,
    createdAt: row.createdAt,
    codeExpiresAt: row.codeExpiresAt,
    unlockDurationMinutes: row.unlockDurationMinutes ?? 60,
    redeemedByUserId: row.redeemedByUserId,
    redeemedAt: row.redeemedAt,
    expiresAt: row.expiresAt,
    status,
    isManualGrant: isManualGrantCode(row.code),
  }
}

type ManualGrantSummary = {
  id: string
  userId: string
  userEmail: string
  userDisplayName: string
  entitlementKey: string
  createdAt: string
  expiresAt: string
}

function mapManualGrant(row: ActivationCodeRecord, user: AuthUserRecord | null): ManualGrantSummary {
  return {
    id: row.id,
    userId: row.redeemedByUserId ?? '',
    userEmail: user?.email ?? '',
    userDisplayName: user?.displayName ?? '',
    entitlementKey: row.entitlementKey,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt ?? MANUAL_GRANT_EXPIRES_AT,
  }
}

function createLocalState(): LocalAuthState {
  return {
    users: [],
    sessions: [],
    activationCodes: [seededActivationCode],
  }
}

async function loadState(filePath: string): Promise<LocalAuthState> {
  try {
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<LocalAuthState>

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      activationCodes: Array.isArray(parsed.activationCodes) && parsed.activationCodes.length > 0
        ? parsed.activationCodes
        : [seededActivationCode],
    }
  } catch {
    return createLocalState()
  }
}

async function saveState(filePath: string, state: LocalAuthState) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

function createRepository(state: LocalAuthState, persist: () => Promise<void>): AuthRepository {
  return {
    async findUserByEmail(email) {
      return state.users.find((user) => user.email === email) ?? null
    },
    async findUserById(id) {
      return state.users.find((user) => user.id === id) ?? null
    },
    async createUser(user) {
      state.users.push(user)
      await persist()
      return user
    },
    async touchUserLogin(userId, lastLoginAt) {
      const user = state.users.find((entry) => entry.id === userId)
      if (user) {
        user.lastLoginAt = lastLoginAt
        user.updatedAt = lastLoginAt
        await persist()
      }
    },
    async createSession(session) {
      state.sessions.push(session)
      await persist()
      return session
    },
    async findSessionByTokenHash(tokenHash) {
      return state.sessions.find((session) => session.tokenHash === tokenHash) ?? null
    },
    async revokeSessionByTokenHash(tokenHash, revokedAt) {
      const session = state.sessions.find((entry) => entry.tokenHash === tokenHash)
      if (session) {
        session.revokedAt = revokedAt
        await persist()
      }
    },
    async listUserEntitlements(userId, nowIso) {
      return state.activationCodes
        .filter((row) => row.redeemedByUserId === userId)
        .filter((row) => row.redeemedAt !== null)
        .filter((row) => row.expiresAt !== null && new Date(row.expiresAt).getTime() > new Date(nowIso).getTime())
        .map((row) => ({ key: row.entitlementKey, expiresAt: row.expiresAt as string }))
    },
    async findActivationCodeByCode(code) {
      return state.activationCodes.find((row) => row.code === code) ?? null
    },
    async redeemActivationCode(code, userId, redeemedAt, unlockExpiresAt) {
      const row = state.activationCodes.find((entry) => entry.code === code)
      if (!row || row.redeemedAt !== null) {
        return false
      }

      row.redeemedByUserId = userId
      row.redeemedAt = redeemedAt
      row.expiresAt = unlockExpiresAt
      await persist()
      return true
    },
    async createActivationCode(activationCode) {
      state.activationCodes.push(activationCode)
      await persist()
      return activationCode
    },
    async updateUserAvatar(userId, avatarId) {
      const user = state.users.find((entry) => entry.id === userId)
      if (user) {
        user.avatarId = avatarId
        user.updatedAt = new Date().toISOString()
        await persist()
      }
    },
  }
}

function secureCookieOptions(request: Request) {
  return {
    secure: new URL(request.url).protocol === 'https:',
  }
}

function requireCookieValue(request: Request) {
  return readCookieValue(request.headers.get('cookie'))
}

function getGrantEntitlements(state: LocalAuthState, userId: string, nowIso: string) {
  return state.activationCodes.filter((row) => row.redeemedByUserId === userId && row.redeemedAt !== null && row.expiresAt !== null && new Date(row.expiresAt).getTime() > new Date(nowIso).getTime())
}

async function listUsers(state: LocalAuthState, query: string) {
  const normalized = query.trim().toLowerCase()
  const nowIso = new Date().toISOString()
  const users = state.users
    .filter((user) => !normalized || user.email.toLowerCase().includes(normalized) || user.displayName.toLowerCase().includes(normalized))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 18)

  return Promise.all(
    users.map(async (user) => {
      const entitlements = getGrantEntitlements(state, user.id, nowIso)
      const manualGrantRows = entitlements.filter((row) => isManualGrantCode(row.code))
      const activeManualGrant = manualGrantRows.length > 0 ? manualGrantRows[0] : null
      const manualGrant = activeManualGrant ? mapManualGrant(activeManualGrant, user) : null

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        avatarId: user.avatarId,
        premiumActive: entitlements.length > 0,
        manualGrant,
        activeEntitlements: entitlements.map((row) => ({
          entitlementKey: row.entitlementKey,
          expiresAt: row.expiresAt as string,
          source: isManualGrantCode(row.code) ? 'manual' : 'code',
        })),
      }
    }),
  )
}

async function listActivationCodes(state: LocalAuthState, query: string) {
  const normalized = query.trim().toLowerCase()
  return state.activationCodes
    .filter((row) => !isManualGrantCode(row.code))
    .filter((row) => !normalized || row.code.toLowerCase().includes(normalized) || row.entitlementKey.toLowerCase().includes(normalized))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 40)
    .map(mapActivationCode)
}

async function listPremiumGrants(state: LocalAuthState) {
  const nowIso = new Date().toISOString()

  return state.activationCodes
    .filter((row) => isManualGrantCode(row.code))
    .filter((row) => row.redeemedAt !== null && row.expiresAt !== null && new Date(row.expiresAt).getTime() > new Date(nowIso).getTime())
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((row) => {
      const user = state.users.find((entry) => entry.id === row.redeemedByUserId) ?? null

      return {
        id: row.id,
        userId: row.redeemedByUserId ?? '',
        userEmail: user?.email ?? '',
        userDisplayName: user?.displayName ?? '',
        entitlementKey: row.entitlementKey,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt ?? MANUAL_GRANT_EXPIRES_AT,
      }
    })
}

async function grantPremium(state: LocalAuthState, persist: () => Promise<void>, input: { userId?: unknown; entitlementKey?: unknown }) {
  const userId = toStringField(input.userId)
  const entitlementKey = normalizeEntitlementKey(input.entitlementKey)

  if (!userId) {
    return errorResponse('Wybierz użytkownika.', 400)
  }

  const user = state.users.find((entry) => entry.id === userId)
  if (!user) {
    return errorResponse('Nie znaleziono użytkownika.', 404, 'not_found')
  }

  const nowIso = new Date().toISOString()
  const existingGrant = state.activationCodes.find(
    (row) =>
      row.redeemedByUserId === userId &&
      row.entitlementKey === entitlementKey &&
      row.redeemedAt !== null &&
      row.expiresAt !== null &&
      new Date(row.expiresAt).getTime() > new Date(nowIso).getTime() &&
      isManualGrantCode(row.code),
  )

  if (existingGrant) {
    return errorResponse('Ten użytkownik ma już aktywny ręczny dostęp.', 409, 'conflict')
  }

  const activeEntitlement = state.activationCodes.find(
    (row) =>
      row.redeemedByUserId === userId &&
      row.entitlementKey === entitlementKey &&
      row.redeemedAt !== null &&
      row.expiresAt !== null &&
      new Date(row.expiresAt).getTime() > new Date(nowIso).getTime(),
  )

  if (activeEntitlement) {
    return errorResponse('Ten użytkownik ma już aktywny dostęp.', 409, 'conflict')
  }

  const grant: ActivationCodeRecord = {
    id: crypto.randomUUID(),
    code: `${MANUAL_GRANT_CODE_PREFIX}${crypto.randomUUID()}`,
    entitlementKey,
    createdAt: nowIso,
    codeExpiresAt: null,
    unlockDurationMinutes: 525600,
    redeemedByUserId: userId,
    redeemedAt: nowIso,
    expiresAt: MANUAL_GRANT_EXPIRES_AT,
  }

  state.activationCodes.push(grant)
  await persist()

  return jsonResponse({
    grant: {
      id: grant.id,
      userId: user.id,
      userEmail: user.email,
      userDisplayName: user.displayName,
      entitlementKey,
      createdAt: nowIso,
      expiresAt: grant.expiresAt,
    },
  }, { status: 201 })
}

async function revokePremium(state: LocalAuthState, persist: () => Promise<void>, input: { grantId?: unknown }) {
  const grantId = toStringField(input.grantId)
  if (!grantId) {
    return errorResponse('Wybierz grant do odebrania.', 400)
  }

  const nowIso = new Date().toISOString()
  const grant = state.activationCodes.find((row) => row.id === grantId && isManualGrantCode(row.code))
  if (!grant || !grant.redeemedByUserId) {
    return errorResponse('Nie znaleziono grantu.', 404, 'not_found')
  }

  grant.expiresAt = nowIso
  await persist()

  const user = state.users.find((entry) => entry.id === grant.redeemedByUserId) ?? null

  return jsonResponse({
    grant: {
      id: grant.id,
      userId: grant.redeemedByUserId,
      userEmail: user?.email ?? '',
      userDisplayName: user?.displayName ?? '',
      entitlementKey: grant.entitlementKey,
      createdAt: grant.createdAt,
      expiresAt: nowIso,
    },
  })
}

function responseFromAuthFailure(error: { code: string; message: string; status: number }) {
  return errorResponse(error.message, error.status, error.code)
}

async function handleRequest(request: Request, state: LocalAuthState, persist: () => Promise<void>) {
  const url = new URL(request.url)
  const { pathname } = url

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) })
  }

  if (pathname === '/api/auth/__health') {
    return jsonResponse({ ok: true })
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await readJsonBody<{ email?: unknown; password?: unknown }>(request)
    if (!body) {
      return errorResponse('Nieprawidłowe dane JSON.', 400)
    }

    const repo = createRepository(state, persist)
    const result = await loginAccount(repo, {
      email: toStringField(body.email),
      password: toStringField(body.password),
    })

    if (isAuthFailure(result)) {
      return responseFromAuthFailure(result.error)
    }

    return jsonResponse(
      { user: result.user },
      {
        status: 200,
        headers: {
          'set-cookie': buildSessionCookie(result.sessionToken, new Date(result.sessionExpiresAt), secureCookieOptions(request)),
        },
      },
    )
  }

  if (pathname === '/api/auth/register' && request.method === 'POST') {
    const body = await readJsonBody<{ email?: unknown; displayName?: unknown; password?: unknown }>(request)
    if (!body) {
      return errorResponse('Nieprawidłowe dane JSON.', 400)
    }

    const repo = createRepository(state, persist)
    const result = await registerAccount(repo, {
      email: toStringField(body.email),
      displayName: toStringField(body.displayName),
      password: toStringField(body.password),
    })

    if (isAuthFailure(result)) {
      return responseFromAuthFailure(result.error)
    }

    return jsonResponse(
      { user: result.user },
      {
        status: 201,
        headers: {
          'set-cookie': buildSessionCookie(result.sessionToken, new Date(result.sessionExpiresAt), secureCookieOptions(request)),
        },
      },
    )
  }

  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const result = await logoutAccount(repo, sessionToken)

    if (isAuthFailure(result)) {
      return responseFromAuthFailure(result.error)
    }

    return jsonResponse(
      { ok: true },
      {
        status: 200,
        headers: {
          'set-cookie': clearSessionCookie(secureCookieOptions(request)),
        },
      },
    )
  }

  if (pathname === '/api/auth/me' && request.method === 'GET') {
    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const result = await getCurrentUser(repo, sessionToken)

    if (isAuthFailure(result)) {
      return responseFromAuthFailure(result.error)
    }

    return jsonResponse({ user: result.user })
  }

  if (pathname === '/api/auth/redeem-code' && request.method === 'POST') {
    const body = await readJsonBody<{ code?: unknown }>(request)
    if (!body) {
      return errorResponse('Nieprawidłowe dane JSON.', 400)
    }

    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const result = await redeemActivationCode(repo, sessionToken, toStringField(body.code))

    if (isAuthFailure(result)) {
      return responseFromAuthFailure(result.error)
    }

    return jsonResponse({ user: result.user })
  }

  if (pathname === '/api/auth/update-avatar' && request.method === 'POST') {
    const body = await readJsonBody<{ avatarId?: unknown }>(request)
    if (!body) {
      return errorResponse('Nieprawidłowe dane JSON.', 400)
    }

    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const result = await updateAvatar(repo, sessionToken, toStringField(body.avatarId))

    if (isAuthFailure(result)) {
      return responseFromAuthFailure(result.error)
    }

    return jsonResponse({ user: result.user })
  }

  if (pathname === '/api/auth/admin/create-code' && request.method === 'POST') {
    const body = await readJsonBody<{ code?: unknown; codeValidityMinutes?: unknown; unlockDurationMinutes?: unknown; durationMinutes?: unknown }>(request)
    if (!body) {
      return errorResponse('Nieprawidłowe dane JSON.', 400)
    }

    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const currentUser = await getCurrentUser(repo, sessionToken)
    if (isAuthFailure(currentUser)) {
      return responseFromAuthFailure(currentUser.error)
    }

    if (!currentUser.user.isAdmin) {
      return errorResponse('Brak uprawnień administratora.', 403, 'forbidden')
    }

    const result = await createActivationCodeRecord(repo, sessionToken, {
      code: toStringField(body.code),
      codeValidityMinutes: Number.isFinite(Number(body.codeValidityMinutes ?? body.durationMinutes))
        ? Math.max(1, Math.floor(Number(body.codeValidityMinutes ?? body.durationMinutes)))
        : 60,
      unlockDurationMinutes: Number.isFinite(Number(body.unlockDurationMinutes ?? body.durationMinutes))
        ? Math.max(1, Math.floor(Number(body.unlockDurationMinutes ?? body.durationMinutes)))
        : 60,
    })

    if (isAuthFailure(result)) {
      return responseFromAuthFailure(result.error)
    }

    return jsonResponse({ user: result.user, activationCode: result.activationCode }, { status: 201 })
  }

  if (pathname === '/api/auth/admin/users' && request.method === 'GET') {
    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const currentUser = await getCurrentUser(repo, sessionToken)
    if (isAuthFailure(currentUser)) {
      return responseFromAuthFailure(currentUser.error)
    }
    if (!currentUser.user.isAdmin) {
      return errorResponse('Brak uprawnień administratora.', 403, 'forbidden')
    }

    const users = await listUsers(state, normalizeSearchQuery(url.searchParams.get('query')))
    return jsonResponse({
      users,
      summary: {
        total: users.length,
        premiumUsers: users.filter((user) => user.premiumActive).length,
        manualGrants: users.filter((user) => user.manualGrant).length,
      },
    })
  }

  if (pathname === '/api/auth/admin/activation-codes' && request.method === 'GET') {
    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const currentUser = await getCurrentUser(repo, sessionToken)
    if (isAuthFailure(currentUser)) {
      return responseFromAuthFailure(currentUser.error)
    }
    if (!currentUser.user.isAdmin) {
      return errorResponse('Brak uprawnień administratora.', 403, 'forbidden')
    }

    return jsonResponse({
      activationCodes: await listActivationCodes(state, normalizeSearchQuery(url.searchParams.get('query'))),
    })
  }

  if (pathname === '/api/auth/admin/premium-grants' && request.method === 'GET') {
    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const currentUser = await getCurrentUser(repo, sessionToken)
    if (isAuthFailure(currentUser)) {
      return responseFromAuthFailure(currentUser.error)
    }
    if (!currentUser.user.isAdmin) {
      return errorResponse('Brak uprawnień administratora.', 403, 'forbidden')
    }

    return jsonResponse({
      grants: await listPremiumGrants(state),
    })
  }

  if (pathname === '/api/auth/admin/premium-grants' && request.method === 'POST') {
    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const currentUser = await getCurrentUser(repo, sessionToken)
    if (isAuthFailure(currentUser)) {
      return responseFromAuthFailure(currentUser.error)
    }
    if (!currentUser.user.isAdmin) {
      return errorResponse('Brak uprawnień administratora.', 403, 'forbidden')
    }

    const body = await readJsonBody<{ userId?: unknown; entitlementKey?: unknown }>(request)
    if (!body) {
      return errorResponse('Nieprawidłowe dane JSON.', 400)
    }

    return grantPremium(state, persist, body)
  }

  if (pathname === '/api/auth/admin/premium-grants' && request.method === 'DELETE') {
    const repo = createRepository(state, persist)
    const sessionToken = requireCookieValue(request)
    const currentUser = await getCurrentUser(repo, sessionToken)
    if (isAuthFailure(currentUser)) {
      return responseFromAuthFailure(currentUser.error)
    }
    if (!currentUser.user.isAdmin) {
      return errorResponse('Brak uprawnień administratora.', 403, 'forbidden')
    }

    const body = await readJsonBody<{ grantId?: unknown }>(request)
    if (!body) {
      return errorResponse('Nieprawidłowe dane JSON.', 400)
    }

    return revokePremium(state, persist, body)
  }

  return errorResponse('Nie znaleziono endpointu.', 404, 'not_found')
}

async function toWebRequest(request: import('node:http').IncomingMessage, port: number) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const body = Buffer.concat(chunks)
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        headers.append(name, entry)
      }
      continue
    }

    if (typeof value === 'string') {
      headers.set(name, value)
    }
  }

  const host = request.headers.host ?? `127.0.0.1:${port}`
  const protocol = 'http:'
  const method = request.method ?? 'GET'

  return new Request(`${protocol}//${host}${request.url ?? '/'}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' || body.length === 0 ? undefined : body,
  })
}

async function main() {
  const port = Number(process.env.AUTH_API_PORT ?? DEFAULT_PORT)
  const dataFile = process.env.AUTH_API_DB_PATH
    ? path.resolve(process.cwd(), process.env.AUTH_API_DB_PATH)
    : path.resolve(process.cwd(), DEFAULT_DATA_FILE)

  const state = await loadState(dataFile)
  const persist = async () => {
    await saveState(dataFile, state)
  }

  await persist()

  let queue = Promise.resolve()
  const runExclusive = <T>(task: () => Promise<T>) => {
    const next = queue.then(task, task)
    queue = next.then(() => undefined, () => undefined)
    return next
  }

  const server = createServer((request, response) => {
    void runExclusive(async () => {
      const webRequest = await toWebRequest(request, port)
      const routeResponse = withCorsHeaders(webRequest, await handleRequest(webRequest, state, persist))

      const headers: Record<string, string> = {}
      routeResponse.headers.forEach((value, key) => {
        headers[key] = value
      })

      response.writeHead(routeResponse.status, headers)
      if (!routeResponse.body) {
        response.end()
        return
      }

      const body = Buffer.from(await routeResponse.arrayBuffer())
      response.end(body)
    }).catch((error) => {
      response.statusCode = 500
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ error: { code: 'internal_error', message: error instanceof Error ? error.message : 'Internal error', status: 500 } }))
    })
  })

  server.listen(port, '127.0.0.1', () => {
    console.log(`[dev-auth] listening on http://127.0.0.1:${port}`)
  })

  const shutdown = () => {
    server.close(() => {
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

void main()

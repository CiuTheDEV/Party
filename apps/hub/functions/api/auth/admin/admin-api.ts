import { createD1AuthRepository, type AuthEnv } from '../_shared'
import { getCurrentUser } from '../../../../src/lib/auth/auth-service'

export type { AuthEnv } from '../_shared'

const MANUAL_GRANT_CODE_PREFIX = 'ADMIN-GRANT-'
const MANUAL_GRANT_EXPIRES_AT = '9999-12-31T23:59:59.000Z'
const DEFAULT_ENTITLEMENT_KEY = 'charades_category_pack'

type D1Prepared = {
  bind: (...values: unknown[]) => {
    first: <T = Record<string, unknown>>() => Promise<T | null>
    all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>
    run: () => Promise<{ meta?: { changes?: number } }>
  }
}

type ActivationCodeRow = {
  id: string
  code: string
  entitlement_key: string
  created_at: string
  code_expires_at: string | null
  unlock_duration_minutes: number | null
  redeemed_by_user_id: string | null
  redeemed_at: string | null
  expires_at: string | null
}

type UserRow = {
  id: string
  email: string
  display_name: string
  created_at: string
  updated_at: string
  last_login_at: string | null
  avatar_id: string | null
}

type ActiveEntitlement = {
  entitlementKey: string
  expiresAt: string
  source: 'code' | 'manual'
}

type UserSummary = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  avatarId: string
  premiumActive: boolean
  manualGrant: ManualGrantSummary | null
  activeEntitlements: ActiveEntitlement[]
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

function readCookieValue(cookieHeader: string | null | undefined, name = 'party_session') {
  if (!cookieHeader) {
    return null
  }

  for (const segment of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = segment.split('=')
    if (rawName.trim() !== name) {
      continue
    }

    return rawValue.join('=').trim() || null
  }

  return null
}

function normalizeSearchQuery(value: unknown) {
  return toStringField(value)
}

function normalizeEntitlementKey(value: unknown) {
  const key = toStringField(value)
  return key || DEFAULT_ENTITLEMENT_KEY
}

function isManualGrantCode(value: string) {
  return value.startsWith(MANUAL_GRANT_CODE_PREFIX)
}

function mapActivationCodeRow(row: ActivationCodeRow) {
  const status = row.redeemed_at && row.expires_at && new Date(row.expires_at).getTime() > Date.now()
    ? 'active'
    : row.redeemed_at
      ? 'expired'
      : row.code_expires_at && new Date(row.code_expires_at).getTime() <= Date.now()
        ? 'expired'
        : 'pending'

  return {
    id: row.id,
    code: row.code,
    entitlementKey: row.entitlement_key,
    createdAt: row.created_at,
    codeExpiresAt: row.code_expires_at,
    unlockDurationMinutes: row.unlock_duration_minutes ?? 60,
    redeemedByUserId: row.redeemed_by_user_id,
    redeemedAt: row.redeemed_at,
    expiresAt: row.expires_at,
    status,
    isManualGrant: isManualGrantCode(row.code),
  }
}

function mapManualGrantRow(row: ActivationCodeRow, user: UserRow | null): ManualGrantSummary {
  return {
    id: row.id,
    userId: row.redeemed_by_user_id ?? '',
    userEmail: user?.email ?? '',
    userDisplayName: user?.display_name ?? '',
    entitlementKey: row.entitlement_key,
    createdAt: row.created_at,
    expiresAt: row.expires_at ?? MANUAL_GRANT_EXPIRES_AT,
  }
}

function mapUserRow(row: UserRow): UserSummary {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    avatarId: row.avatar_id ?? 'smile',
    premiumActive: false,
    manualGrant: null,
    activeEntitlements: [],
  }
}

function createDb(db: AuthEnv['DB']) {
  return db as AuthEnv['DB'] & { prepare: (query: string) => D1Prepared }
}

async function requireAdminUser(request: Request, env: AuthEnv) {
  const repo = createD1AuthRepository(env.DB)
  const sessionToken = readCookieValue(request.headers.get('cookie'))
  const currentUser = await getCurrentUser(repo, sessionToken)

  if (currentUser.ok === false) {
    return { ok: false as const, response: errorResponse(currentUser.error.message, currentUser.error.status, currentUser.error.code) }
  }

  if (!currentUser.user.isAdmin) {
    return {
      ok: false as const,
      response: errorResponse('Brak uprawnień administratora.', 403, 'forbidden'),
    }
  }

  return { ok: true as const, user: currentUser.user }
}

async function listActiveEntitlements(db: AuthEnv['DB'], userId: string, nowIso: string) {
  const rows = await createDb(db)
    .prepare(
      'SELECT id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at FROM activation_codes WHERE redeemed_by_user_id = ?1 AND redeemed_at IS NOT NULL AND expires_at IS NOT NULL AND expires_at > ?2 ORDER BY expires_at DESC, created_at DESC',
    )
    .bind(userId, nowIso)
    .all<ActivationCodeRow>()

  return rows.results.map((row) => ({
    entitlementKey: row.entitlement_key,
    expiresAt: row.expires_at as string,
    source: isManualGrantCode(row.code) ? 'manual' : 'code',
  }) as ActiveEntitlement)
}

async function findActivePremiumGrant(db: AuthEnv['DB'], userId: string, entitlementKey: string, nowIso: string) {
  return createDb(db)
    .prepare(
      'SELECT id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at FROM activation_codes WHERE redeemed_by_user_id = ?1 AND entitlement_key = ?2 AND redeemed_at IS NOT NULL AND expires_at IS NOT NULL AND expires_at > ?3 AND code LIKE ?4 LIMIT 1',
    )
    .bind(userId, entitlementKey, nowIso, `${MANUAL_GRANT_CODE_PREFIX}%`)
    .first<ActivationCodeRow>()
}

async function loadUserRow(db: AuthEnv['DB'], userId: string) {
  return createDb(db)
    .prepare(
      'SELECT id, email, display_name, created_at, updated_at, last_login_at, avatar_id FROM users WHERE id = ?1 LIMIT 1',
    )
    .bind(userId)
    .first<UserRow>()
}

async function listUsersData(db: AuthEnv['DB'], query: string) {
  const normalizedQuery = query.trim()
  const likeQuery = `%${normalizedQuery}%`

  const usersQuery = normalizedQuery
    ? 'SELECT id, email, display_name, created_at, updated_at, last_login_at, avatar_id FROM users WHERE email LIKE ?1 OR display_name LIKE ?1 ORDER BY created_at DESC LIMIT 18'
    : 'SELECT id, email, display_name, created_at, updated_at, last_login_at, avatar_id FROM users ORDER BY created_at DESC LIMIT 18'

  const rows = normalizedQuery
    ? await createDb(db).prepare(usersQuery).bind(likeQuery).all<UserRow>()
    : await createDb(db).prepare(usersQuery).bind().all<UserRow>()

  const nowIso = new Date().toISOString()
  const users = await Promise.all(
    rows.results.map(async (row) => {
      const entitlements = await listActiveEntitlements(db, row.id, nowIso)
      const manualGrant = entitlements
        .filter((entry) => entry.source === 'manual')
        .map((entry) => ({
          entitlementKey: entry.entitlementKey,
          expiresAt: entry.expiresAt,
        }))

      const activeManualGrantRow = manualGrant.length > 0
        ? await createDb(db)
            .prepare(
              'SELECT id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at FROM activation_codes WHERE redeemed_by_user_id = ?1 AND redeemed_at IS NOT NULL AND expires_at IS NOT NULL AND expires_at > ?2 AND code LIKE ?3 ORDER BY expires_at DESC, created_at DESC LIMIT 1',
            )
            .bind(row.id, nowIso, `${MANUAL_GRANT_CODE_PREFIX}%`)
            .first<ActivationCodeRow>()
        : null

      const user = mapUserRow(row)
      const manualGrantSummary = activeManualGrantRow ? mapManualGrantRow(activeManualGrantRow, row) : null

      return {
        ...user,
        premiumActive: entitlements.length > 0,
        manualGrant: manualGrantSummary,
        activeEntitlements: entitlements,
      }
    }),
  )

  return users
}

export async function listUsersFromRequest(request: Request, env: AuthEnv) {
  const admin = await requireAdminUser(request, env)
  if (!admin.ok) {
    return admin.response
  }

  const url = new URL(request.url)
  const users = await listUsersData(env.DB, normalizeSearchQuery(url.searchParams.get('query')))

  return jsonResponse({
    users,
    summary: {
      total: users.length,
      premiumUsers: users.filter((user) => user.premiumActive).length,
      manualGrants: users.filter((user) => user.manualGrant).length,
    },
  })
}

export async function listActivationCodesFromRequest(request: Request, env: AuthEnv) {
  const admin = await requireAdminUser(request, env)
  if (!admin.ok) {
    return admin.response
  }

  const url = new URL(request.url)
  const query = normalizeSearchQuery(url.searchParams.get('query'))
  const likeQuery = `%${query}%`

  const activationCodesQuery = query
    ? "SELECT id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at FROM activation_codes WHERE code NOT LIKE ?1 AND (code LIKE ?2 OR entitlement_key LIKE ?2) ORDER BY created_at DESC LIMIT 40"
    : "SELECT id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at FROM activation_codes WHERE code NOT LIKE ?1 ORDER BY created_at DESC LIMIT 40"

  const rows = query
    ? await createDb(env.DB).prepare(activationCodesQuery).bind(`${MANUAL_GRANT_CODE_PREFIX}%`, likeQuery).all<ActivationCodeRow>()
    : await createDb(env.DB).prepare(activationCodesQuery).bind(`${MANUAL_GRANT_CODE_PREFIX}%`).all<ActivationCodeRow>()

  return jsonResponse({
    activationCodes: rows.results.map(mapActivationCodeRow),
  })
}

export async function listPremiumGrantsFromRequest(request: Request, env: AuthEnv) {
  const admin = await requireAdminUser(request, env)
  if (!admin.ok) {
    return admin.response
  }

  const rows = await createDb(env.DB)
    .prepare(
      'SELECT ac.id, ac.code, ac.entitlement_key, ac.created_at, ac.code_expires_at, ac.unlock_duration_minutes, ac.redeemed_by_user_id, ac.redeemed_at, ac.expires_at, u.id AS user_id, u.email, u.display_name, u.created_at AS user_created_at, u.updated_at AS user_updated_at, u.last_login_at, u.avatar_id FROM activation_codes ac LEFT JOIN users u ON u.id = ac.redeemed_by_user_id WHERE ac.code LIKE ?1 AND ac.redeemed_at IS NOT NULL AND ac.expires_at IS NOT NULL AND ac.expires_at > ?2 ORDER BY ac.expires_at DESC, ac.created_at DESC',
    )
    .bind(`${MANUAL_GRANT_CODE_PREFIX}%`, new Date().toISOString())
    .all<
      ActivationCodeRow & {
        user_id: string | null
        email: string | null
        display_name: string | null
        user_created_at: string | null
        user_updated_at: string | null
        last_login_at: string | null
        avatar_id: string | null
      }
    >()

  return jsonResponse({
    grants: rows.results.map((row) => ({
      id: row.id,
      userId: row.user_id ?? '',
      userEmail: row.email ?? '',
      userDisplayName: row.display_name ?? '',
      entitlementKey: row.entitlement_key,
      createdAt: row.created_at,
      expiresAt: row.expires_at ?? MANUAL_GRANT_EXPIRES_AT,
    })),
  })
}

export async function grantPremiumFromRequest(request: Request, env: AuthEnv) {
  const admin = await requireAdminUser(request, env)
  if (!admin.ok) {
    return admin.response
  }

  const body = await readJsonBody<{ userId?: unknown; entitlementKey?: unknown }>(request)
  if (!body) {
    return errorResponse('Nieprawidłowe dane JSON.', 400)
  }

  const userId = toStringField(body.userId)
  const entitlementKey = normalizeEntitlementKey(body.entitlementKey)

  if (!userId) {
    return errorResponse('Wybierz użytkownika.', 400)
  }

  const targetUser = await loadUserRow(env.DB, userId)
  if (!targetUser) {
    return errorResponse('Nie znaleziono użytkownika.', 404, 'not_found')
  }

  const nowIso = new Date().toISOString()
  const existingActiveGrant = await findActivePremiumGrant(env.DB, userId, entitlementKey, nowIso)
  if (existingActiveGrant) {
    return errorResponse('Ten użytkownik ma już aktywny ręczny dostęp.', 409, 'conflict')
  }

  const activeEntitlements = await listActiveEntitlements(env.DB, userId, nowIso)
  if (activeEntitlements.some((entry) => entry.entitlementKey === entitlementKey)) {
    return errorResponse('Ten użytkownik ma już aktywny dostęp.', 409, 'conflict')
  }

  const grant = {
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

  await createDb(env.DB)
    .prepare(
      'INSERT INTO activation_codes (id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)',
    )
    .bind(
      grant.id,
      grant.code,
      grant.entitlementKey,
      grant.createdAt,
      grant.codeExpiresAt,
      grant.unlockDurationMinutes,
      grant.redeemedByUserId,
      grant.redeemedAt,
      grant.expiresAt,
    )
    .run()

  return jsonResponse({
    grant: {
      id: grant.id,
      userId: targetUser.id,
      userEmail: targetUser.email,
      userDisplayName: targetUser.display_name,
      entitlementKey,
      createdAt: nowIso,
      expiresAt: grant.expiresAt,
    },
  }, { status: 201 })
}

export async function revokePremiumFromRequest(request: Request, env: AuthEnv) {
  const admin = await requireAdminUser(request, env)
  if (!admin.ok) {
    return admin.response
  }

  const body = await readJsonBody<{ grantId?: unknown }>(request)
  if (!body) {
    return errorResponse('Nieprawidłowe dane JSON.', 400)
  }

  const grantId = toStringField(body.grantId)
  if (!grantId) {
    return errorResponse('Wybierz grant do odebrania.', 400)
  }

  const nowIso = new Date().toISOString()
  const grant = await createDb(env.DB)
    .prepare(
      'SELECT id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at FROM activation_codes WHERE id = ?1 AND code LIKE ?2 LIMIT 1',
    )
    .bind(grantId, `${MANUAL_GRANT_CODE_PREFIX}%`)
    .first<ActivationCodeRow>()

  if (!grant || !grant.redeemed_by_user_id) {
    return errorResponse('Nie znaleziono grantu.', 404, 'not_found')
  }

  const result = (await createDb(env.DB)
    .prepare('UPDATE activation_codes SET expires_at = ?1 WHERE id = ?2 AND code LIKE ?3')
    .bind(nowIso, grantId, `${MANUAL_GRANT_CODE_PREFIX}%`)
    .run()) as { meta?: { changes?: number } }

  if ((result.meta?.changes ?? 0) === 0) {
    return errorResponse('Nie udało się odebrać dostępu.', 409, 'conflict')
  }

  const user = await loadUserRow(env.DB, grant.redeemed_by_user_id)

  return jsonResponse({
    grant: {
      id: grant.id,
      userId: grant.redeemed_by_user_id,
      userEmail: user?.email ?? '',
      userDisplayName: user?.display_name ?? '',
      entitlementKey: grant.entitlement_key,
      createdAt: grant.created_at,
      expiresAt: nowIso,
    },
  })
}

import {
  buildSessionCookie,
  clearSessionCookie,
  readCookieValue,
} from '../../../src/lib/auth/auth-domain'
import {
  createActivationCode,
  getCurrentUser,
  loginAccount,
  logoutAccount,
  redeemActivationCode,
  registerAccount,
  updateAvatar,
  type AuthFailure,
  type AuthRepository,
  type ActivationCodeRecord,
  type AuthSessionRecord,
  type AuthUserRecord,
} from '../../../src/lib/auth/auth-service'

// Mirrors PARTY_AVATARS IDs from @party/ui — kept here to avoid bundling UI into Pages Functions
const VALID_AVATAR_IDS = new Set([
  'smile', 'smile-with-big-eyes', 'grin', 'grinning', 'laughing-face', 'grin-sweat',
  'joy-face', 'rofl', 'loudly-crying', 'wink-face', 'kissing', 'kissing-smiling-eyes',
  'kissing-closed-eyes', 'kissing-face', 'smiling-hearts', 'heart-eyes', 'star-struck',
  'partying-face', 'melting-face', 'upside-down-face', 'slightly-happy', 'happy-cry',
  'holding-back-tears', 'blush', 'relieved',
  'smirk', 'drool', 'yum', 'stuck-out-tongue', 'squinting-tongue', 'tongue-face',
  'zany-face', 'woozy-face', 'pensive', 'pleading', 'grimacing', 'expressionless',
  'neutral-face', 'mouth-none', 'dotted-line-face', 'zipper-face',
  'salute', 'thinking-face', 'shushing-face', 'hand-over-mouth', 'smiling-eyes-hand-over-mouth',
  'yawn', 'hug-face', 'peeking', 'screaming', 'raised-eyebrow', 'monocle-face',
  'unamused', 'rolling-eyes', 'triumph', 'angry', 'rage', 'cursing',
  'sad', 'sweat', 'worried', 'concerned', 'cry', 'frown',
  'diagonal-mouth', 'anxious-with-sweat', 'scared', 'anguished',
  'gasp', 'mouth-open', 'surprised', 'astonished', 'flushed', 'mind-blown',
  'scrunched-mouth', 'scrunched-eyes', 'weary', 'distraught', 'x-eyes', 'dizzy-face',
  'shaking-face', 'cold-face', 'hot-face', 'sick', 'vomit', 'sleep',
  'sleepy-face', 'sneeze', 'thermometer-face', 'bandage-face', 'mask', 'liar',
  'angel-face', 'cowboy-face', 'money-face', 'nerd-face', 'sunglasses-face',
  'disguise', 'clown-face', 'poop', 'imp-smile', 'imp-frown', 'ghost', 'skull',
  'snowman', 'jack-o-lantern', 'robot-face', 'alien', 'alien-monster',
  'sun-with-face', 'moon-face-first-quarter', 'moon-face-last-quarter', 'smiley-cat',
  'smile-cat', 'joy-cat', 'heart-eyes-cat', 'smirk-cat', 'kissing-cat', 'scream-cat',
  'crying-cat-face', 'pouting-cat', 'see-no-evil', 'hear-no-evil', 'speak-no-evil',
  'cow-face', 'unicorn', 'lizard', 'dragon', 't-rex', 'dinosaur', 'turtle', 'crocodile',
  'snake', 'frog', 'rabbit', 'rat', 'poodle', 'dog', 'guide-dog', 'pig', 'racehorse',
  'donkey', 'ox', 'goat', 'kangaroo', 'tiger', 'monkey', 'gorilla', 'orangutan',
  'chipmunk', 'otter', 'bat', 'bird', 'rooster', 'hatching-chick', 'baby-chick',
  'hatched-chick', 'eagle', 'owl', 'peace-dove', 'goose', 'peacock', 'seal', 'shark',
  'dolphin', 'whale', 'fish', 'blowfish', 'lobster', 'crab', 'octopus', 'jellyfish',
  'scorpion', 'spider', 'snail', 'ant', 'mosquito', 'cockroach', 'fly', 'bee',
  'lady-bug', 'butterfly', 'bug', 'worm',
  'theater', 'circus', 'palette', 'clapper', 'microphone', 'guitar', 'dart', 'trophy',
  'star', 'fire', 'gem', 'rocket', 'lightning', 'soccer-ball', 'dice', 'crown',
  'headphones', 'basketball', 'volleyball', 'gamepad', 'joystick', 'camera', 'movie-camera',
  'books', 'magic-wand', 'saturn', 'crystal-ball',
])

type D1Prepared = {
  bind: (...values: unknown[]) => {
    first: <T = Record<string, unknown>>() => Promise<T | null>
    all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>
    run: () => Promise<unknown>
  }
}

export type AuthEnv = {
  DB: {
    prepare: (query: string) => D1Prepared
  }
}

type D1UserRow = {
  id: string
  email: string
  display_name: string
  password_hash: string
  created_at: string
  updated_at: string
  last_login_at: string | null
  avatar_id: string | null
}

type D1SessionRow = {
  id: string
  user_id: string
  token_hash: string
  created_at: string
  expires_at: string
  revoked_at: string | null
}

type D1ActivationCodeRow = {
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

function mapUser(row: D1UserRow): AuthUserRecord {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    avatarId: row.avatar_id ?? 'smile',
  }
}

function mapSession(row: D1SessionRow): AuthSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  }
}

function mapActivationCode(row: D1ActivationCodeRow): ActivationCodeRecord {
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
  }
}

export function createD1AuthRepository(db: AuthEnv['DB']): AuthRepository {
  return {
    async findUserByEmail(email) {
      const row = await db
        .prepare(
          'SELECT id, email, display_name, password_hash, created_at, updated_at, last_login_at, avatar_id FROM users WHERE email = ?1 LIMIT 1',
        )
        .bind(email)
        .first<D1UserRow>()

      return row ? mapUser(row) : null
    },
    async findUserById(id) {
      const row = await db
        .prepare(
          'SELECT id, email, display_name, password_hash, created_at, updated_at, last_login_at, avatar_id FROM users WHERE id = ?1 LIMIT 1',
        )
        .bind(id)
        .first<D1UserRow>()

      return row ? mapUser(row) : null
    },
    async createUser(user) {
      await db
        .prepare(
          'INSERT INTO users (id, email, display_name, password_hash, created_at, updated_at, last_login_at, avatar_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)',
        )
        .bind(
          user.id,
          user.email,
          user.displayName,
          user.passwordHash,
          user.createdAt,
          user.updatedAt,
          user.lastLoginAt,
          user.avatarId,
        )
        .run()

      return user
    },
    async touchUserLogin(userId, lastLoginAt) {
      await db
        .prepare('UPDATE users SET last_login_at = ?1, updated_at = ?2 WHERE id = ?3')
        .bind(lastLoginAt, lastLoginAt, userId)
        .run()
    },
    async createSession(session) {
      await db
        .prepare(
          'INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at, revoked_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)',
        )
        .bind(session.id, session.userId, session.tokenHash, session.createdAt, session.expiresAt, session.revokedAt)
        .run()

      return session
    },
    async findSessionByTokenHash(tokenHash) {
      const row = await db
        .prepare(
          'SELECT id, user_id, token_hash, created_at, expires_at, revoked_at FROM sessions WHERE token_hash = ?1 LIMIT 1',
        )
        .bind(tokenHash)
        .first<D1SessionRow>()

      return row ? mapSession(row) : null
    },
    async revokeSessionByTokenHash(tokenHash, revokedAt) {
      await db
        .prepare('UPDATE sessions SET revoked_at = ?1 WHERE token_hash = ?2')
        .bind(revokedAt, tokenHash)
        .run()
    },
    async listUserEntitlements(userId, nowIso) {
      const rows = await db
        .prepare(
          'SELECT entitlement_key, expires_at, id, code, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at FROM activation_codes WHERE redeemed_by_user_id = ?1 AND redeemed_at IS NOT NULL AND (expires_at IS NULL OR expires_at > ?2)',
        )
        .bind(userId, nowIso)
        .all<D1ActivationCodeRow>()

      return rows.results
        .filter((row) => row.expires_at !== null)
        .map((row) => ({ key: row.entitlement_key, expiresAt: row.expires_at as string }))
    },
    async findActivationCodeByCode(code) {
      const row = await db
        .prepare(
          'SELECT id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at FROM activation_codes WHERE code = ?1 LIMIT 1',
        )
        .bind(code)
        .first<D1ActivationCodeRow>()

      return row ? mapActivationCode(row) : null
    },
    async redeemActivationCode(code, userId, redeemedAt, unlockExpiresAt) {
      const result = (await db
        .prepare(
          'UPDATE activation_codes SET redeemed_by_user_id = ?2, redeemed_at = ?3, expires_at = ?4 WHERE code = ?1 AND redeemed_at IS NULL',
        )
        .bind(code, userId, redeemedAt, unlockExpiresAt)
        .run()) as { meta?: { changes?: number } }

      return result.meta?.changes === 1
    },
    async updateUserAvatar(userId, avatarId) {
      await db
        .prepare('UPDATE users SET avatar_id = ?1, updated_at = ?2 WHERE id = ?3')
        .bind(avatarId, new Date().toISOString(), userId)
        .run()
    },
    async createActivationCode(activationCode) {
      await db
        .prepare(
          'INSERT INTO activation_codes (id, code, entitlement_key, created_at, code_expires_at, unlock_duration_minutes, redeemed_by_user_id, redeemed_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)',
        )
        .bind(
          activationCode.id,
          activationCode.code,
          activationCode.entitlementKey,
          activationCode.createdAt,
          activationCode.codeExpiresAt,
          activationCode.unlockDurationMinutes,
          activationCode.redeemedByUserId,
          activationCode.redeemedAt,
          activationCode.expiresAt,
        )
        .run()

      return activationCode
    },
  }
}

function secureCookieOptions(request: Request) {
  return {
    secure: new URL(request.url).protocol === 'https:',
  }
}

async function readJsonBody<T extends Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  })
}

function errorResponse(error: AuthFailure) {
  return jsonResponse({ error }, { status: error.status })
}

function toStringField(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizeCodeField(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeMinutesField(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.floor(value))
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.floor(parsed))
    }
  }

  return Math.max(1, Math.floor(fallback))
}

function normalizeCodeValidityMinutesField(value: unknown) {
  return normalizeMinutesField(value, 60)
}

function normalizeUnlockDurationMinutesField(value: unknown) {
  return normalizeMinutesField(value, 60)
}

export async function registerFromRequest(request: Request, env: AuthEnv) {
  const body = await readJsonBody<{ email?: unknown; displayName?: unknown; password?: unknown }>(request)
  if (!body) {
    return errorResponse({ code: 'invalid_input', message: 'Invalid JSON.', status: 400 })
  }

  const repo = createD1AuthRepository(env.DB)
  const result = await registerAccount(repo, {
    email: toStringField(body.email),
    displayName: toStringField(body.displayName),
    password: toStringField(body.password),
  })

  if (result.ok === false) {
    return errorResponse(result.error)
  }

  return jsonResponse(
    { user: result.user },
    {
      status: 201,
      headers: {
        'set-cookie': buildSessionCookie(
          result.sessionToken,
          new Date(result.sessionExpiresAt),
          secureCookieOptions(request),
        ),
      },
    },
  )
}

export async function loginFromRequest(request: Request, env: AuthEnv) {
  const body = await readJsonBody<{ email?: unknown; password?: unknown }>(request)
  if (!body) {
    return errorResponse({ code: 'invalid_input', message: 'Invalid JSON.', status: 400 })
  }

  const repo = createD1AuthRepository(env.DB)
  const result = await loginAccount(repo, {
    email: toStringField(body.email),
    password: toStringField(body.password),
  })

  if (result.ok === false) {
    return errorResponse(result.error)
  }

  return jsonResponse(
    { user: result.user },
    {
      status: 200,
      headers: {
        'set-cookie': buildSessionCookie(
          result.sessionToken,
          new Date(result.sessionExpiresAt),
          secureCookieOptions(request),
        ),
      },
    },
  )
}

export async function logoutFromRequest(request: Request, env: AuthEnv) {
  const repo = createD1AuthRepository(env.DB)
  const sessionToken = readCookieValue(request.headers.get('cookie'))
  const result = await logoutAccount(repo, sessionToken)

  if (result.ok === false) {
    return errorResponse(result.error)
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

export async function meFromRequest(request: Request, env: AuthEnv) {
  const repo = createD1AuthRepository(env.DB)
  const sessionToken = readCookieValue(request.headers.get('cookie'))
  const result = await getCurrentUser(repo, sessionToken)

  if (result.ok === false) {
    return errorResponse(result.error)
  }

  return jsonResponse({ user: result.user })
}

export async function redeemCodeFromRequest(request: Request, env: AuthEnv) {
  const body = await readJsonBody<{ code?: unknown }>(request)
  if (!body) {
    return errorResponse({ code: 'invalid_input', message: 'Invalid JSON.', status: 400 })
  }

  const repo = createD1AuthRepository(env.DB)
  const sessionToken = readCookieValue(request.headers.get('cookie'))
  const result = await redeemActivationCode(repo, sessionToken, normalizeCodeField(body.code))

  if (result.ok === false) {
    return errorResponse(result.error)
  }

  return jsonResponse({ user: result.user })
}

export async function updateAvatarFromRequest(request: Request, env: AuthEnv) {
  const body = await readJsonBody<{ avatarId?: unknown }>(request)
  if (!body) {
    return errorResponse({ code: 'invalid_input', message: 'Invalid JSON.', status: 400 })
  }

  const avatarId = toStringField(body.avatarId)
  if (!avatarId || !VALID_AVATAR_IDS.has(avatarId)) {
    return errorResponse({ code: 'invalid_input', message: 'Nieprawidłowy identyfikator awatara.', status: 400 })
  }

  const repo = createD1AuthRepository(env.DB)
  const sessionToken = readCookieValue(request.headers.get('cookie'))
  const result = await updateAvatar(repo, sessionToken, avatarId)

  if (result.ok === false) {
    return errorResponse(result.error)
  }

  return jsonResponse({ user: result.user })
}

export async function createActivationCodeFromRequest(request: Request, env: AuthEnv) {
  const body = await readJsonBody<{
    code?: unknown
    codeValidityMinutes?: unknown
    unlockDurationMinutes?: unknown
    durationMinutes?: unknown
  }>(request)
  if (!body) {
    return errorResponse({ code: 'invalid_input', message: 'Invalid JSON.', status: 400 })
  }

  const repo = createD1AuthRepository(env.DB)
  const sessionToken = readCookieValue(request.headers.get('cookie'))
  const result = await createActivationCode(
    repo,
    sessionToken,
    {
      code: normalizeCodeField(body.code),
      codeValidityMinutes: normalizeCodeValidityMinutesField(body.codeValidityMinutes ?? body.durationMinutes),
      unlockDurationMinutes: normalizeUnlockDurationMinutesField(body.unlockDurationMinutes ?? body.durationMinutes),
    },
  )

  if (result.ok === false) {
    return errorResponse(result.error)
  }

  return jsonResponse({ user: result.user, activationCode: result.activationCode }, { status: 201 })
}

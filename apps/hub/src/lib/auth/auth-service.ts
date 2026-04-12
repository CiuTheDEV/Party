import { createSessionExpiresAt, normalizeDisplayName, validateEmail, validatePassword } from './auth-domain'
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from './auth-crypto'

export type AuthUserRecord = {
  id: string
  email: string
  displayName: string
  passwordHash: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export type AuthSessionRecord = {
  id: string
  userId: string
  tokenHash: string
  createdAt: string
  expiresAt: string
  revokedAt: string | null
}

export type PublicAuthUser = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export type AuthFailure = {
  code: string
  message: string
  status: number
}

export type AuthResult<T> =
  | { ok: true; user: PublicAuthUser } & T
  | { ok: false; error: AuthFailure }

export type AuthLogoutResult = { ok: true } | { ok: false; error: AuthFailure }

export type AuthRepository = {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>
  findUserById(id: string): Promise<AuthUserRecord | null>
  createUser(user: AuthUserRecord): Promise<AuthUserRecord>
  touchUserLogin(userId: string, lastLoginAt: string): Promise<void>
  createSession(session: AuthSessionRecord): Promise<AuthSessionRecord>
  findSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null>
  revokeSessionByTokenHash(tokenHash: string, revokedAt: string): Promise<void>
}

export type AuthDeps = {
  now?: () => Date
  createSessionToken?: () => string
  hashPassword?: (password: string) => Promise<string>
  verifyPassword?: (password: string, hash: string) => Promise<boolean>
}

export type RegisterInput = {
  email: string
  displayName: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}

const invalidInputError: AuthFailure = {
  code: 'invalid_input',
  message: 'Sprawdź dane i spróbuj ponownie.',
  status: 400,
}

const emailTakenError: AuthFailure = {
  code: 'email_taken',
  message: 'To konto e-mail już istnieje.',
  status: 409,
}

const invalidCredentialsError: AuthFailure = {
  code: 'invalid_credentials',
  message: 'Nieprawidłowy e-mail lub hasło.',
  status: 401,
}

const sessionNotFoundError: AuthFailure = {
  code: 'session_not_found',
  message: 'Sesja wygasła.',
  status: 401,
}

function publicUser(user: AuthUserRecord): PublicAuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  }
}

function resolveNow(deps: AuthDeps) {
  return deps.now?.() ?? new Date()
}

function resolveCreateSessionToken(deps: AuthDeps) {
  return deps.createSessionToken?.() ?? createSessionToken()
}

function resolveHashPassword(deps: AuthDeps) {
  return deps.hashPassword ?? hashPassword
}

function resolveVerifyPassword(deps: AuthDeps) {
  return deps.verifyPassword ?? verifyPassword
}

function buildInvalidInput(message: string): AuthFailure {
  return { ...invalidInputError, message }
}

export async function registerAccount(
  repo: AuthRepository,
  input: RegisterInput,
  deps: AuthDeps = {},
): Promise<
  | { ok: true; user: PublicAuthUser; sessionToken: string; sessionExpiresAt: string }
  | { ok: false; error: AuthFailure }
> {
  const emailResult = validateEmail(input.email)
  if (emailResult.ok === false) {
    return { ok: false, error: { ...invalidInputError, message: emailResult.message } }
  }

  const displayName = normalizeDisplayName(input.displayName)
  if (!displayName) {
    return { ok: false, error: buildInvalidInput('Podaj nazwę użytkownika.') }
  }

  const passwordResult = validatePassword(input.password)
  if (passwordResult.ok === false) {
    return { ok: false, error: { ...invalidInputError, message: passwordResult.message } }
  }

  const existingUser = await repo.findUserByEmail(emailResult.value)
  if (existingUser) {
    return { ok: false, error: emailTakenError }
  }

  const now = resolveNow(deps)
  const nowIso = now.toISOString()
  const sessionExpiresAt = createSessionExpiresAt(now)
  const hashPassword = resolveHashPassword(deps)
  const sessionToken = resolveCreateSessionToken(deps)
  const sessionTokenHash = await hashSessionToken(sessionToken)

  const createdUser = await repo.createUser({
    id: crypto.randomUUID(),
    email: emailResult.value,
    displayName,
    passwordHash: await hashPassword(passwordResult.value),
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: nowIso,
  })

  await repo.createSession({
    id: crypto.randomUUID(),
    userId: createdUser.id,
    tokenHash: sessionTokenHash,
    createdAt: nowIso,
    expiresAt: sessionExpiresAt.toISOString(),
    revokedAt: null,
  })

  await repo.touchUserLogin(createdUser.id, nowIso)

  return {
    ok: true,
    user: publicUser({
      ...createdUser,
      lastLoginAt: nowIso,
    }),
    sessionToken,
    sessionExpiresAt: sessionExpiresAt.toISOString(),
  }
}

export async function loginAccount(
  repo: AuthRepository,
  input: LoginInput,
  deps: AuthDeps = {},
): Promise<
  | { ok: true; user: PublicAuthUser; sessionToken: string; sessionExpiresAt: string }
  | { ok: false; error: AuthFailure }
> {
  const emailResult = validateEmail(input.email)
  if (emailResult.ok === false) {
    return { ok: false, error: invalidCredentialsError }
  }

  const passwordResult = validatePassword(input.password)
  if (passwordResult.ok === false) {
    return { ok: false, error: invalidCredentialsError }
  }

  const user = await repo.findUserByEmail(emailResult.value)
  if (!user) {
    return { ok: false, error: invalidCredentialsError }
  }

  const verifyPassword = resolveVerifyPassword(deps)
  const passwordMatches = await verifyPassword(passwordResult.value, user.passwordHash)
  if (!passwordMatches) {
    return { ok: false, error: invalidCredentialsError }
  }

  const now = resolveNow(deps)
  const nowIso = now.toISOString()
  const sessionExpiresAt = createSessionExpiresAt(now)
  const sessionToken = resolveCreateSessionToken(deps)
  const sessionTokenHash = await hashSessionToken(sessionToken)

  await repo.createSession({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: sessionTokenHash,
    createdAt: nowIso,
    expiresAt: sessionExpiresAt.toISOString(),
    revokedAt: null,
  })

  await repo.touchUserLogin(user.id, nowIso)

  return {
    ok: true,
    user: publicUser({
      ...user,
      lastLoginAt: nowIso,
      updatedAt: nowIso,
    }),
    sessionToken,
    sessionExpiresAt: sessionExpiresAt.toISOString(),
  }
}

export async function logoutAccount(
  repo: AuthRepository,
  sessionToken: string | null | undefined,
  deps: AuthDeps = {},
): Promise<AuthLogoutResult> {
  if (!sessionToken) {
    return { ok: true }
  }

  const now = resolveNow(deps).toISOString()
  const sessionTokenHash = await hashSessionToken(sessionToken)
  await repo.revokeSessionByTokenHash(sessionTokenHash, now)

  return { ok: true }
}

export async function getCurrentUser(
  repo: AuthRepository,
  sessionToken: string | null | undefined,
  deps: AuthDeps = {},
): Promise<
  | { ok: true; user: PublicAuthUser }
  | { ok: false; error: AuthFailure }
> {
  if (!sessionToken) {
    return { ok: false, error: sessionNotFoundError }
  }

  const sessionTokenHash = await hashSessionToken(sessionToken)
  const session = await repo.findSessionByTokenHash(sessionTokenHash)
  if (!session) {
    return { ok: false, error: sessionNotFoundError }
  }

  const now = resolveNow(deps)
  if (session.revokedAt || new Date(session.expiresAt).getTime() <= now.getTime()) {
    return { ok: false, error: sessionNotFoundError }
  }

  const user = await repo.findUserById(session.userId)
  if (!user) {
    return { ok: false, error: sessionNotFoundError }
  }

  return {
    ok: true,
    user: publicUser(user),
  }
}

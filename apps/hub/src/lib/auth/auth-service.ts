import {
  createSessionExpiresAt,
  isAdminEmail,
  normalizeActivationCode,
  normalizeDisplayName,
  validateEmail,
  validatePassword,
} from './auth-domain'
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

export type ActivationCodeRecord = {
  id: string
  code: string
  entitlementKey: string
  createdAt: string
  redeemedByUserId: string | null
  redeemedAt: string | null
}

export type PublicAuthUser = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  entitlements: string[]
  isAdmin: boolean
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
  listUserEntitlementKeys(userId: string): Promise<string[]>
  findActivationCodeByCode(code: string): Promise<ActivationCodeRecord | null>
  redeemActivationCode(code: string, userId: string, redeemedAt: string): Promise<boolean>
  createActivationCode(activationCode: ActivationCodeRecord): Promise<ActivationCodeRecord>
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

const forbiddenError: AuthFailure = {
  code: 'forbidden',
  message: 'Brak uprawnieĹ„ administratora.',
  status: 403,
}

const activationCodeTakenError: AuthFailure = {
  code: 'activation_code_taken',
  message: 'Taki kod juĹĽ istnieje.',
  status: 409,
}

function publicUser(user: AuthUserRecord, entitlements: string[] = []): PublicAuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    entitlements,
    isAdmin: isAdminEmail(user.email),
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

async function resolveUserEntitlementKeys(repo: AuthRepository, userId: string) {
  try {
    return await repo.listUserEntitlementKeys(userId)
  } catch {
    return []
  }
}

function buildInvalidInput(message: string): AuthFailure {
  return { ...invalidInputError, message }
}

function normalizePublicUser(user: AuthUserRecord, entitlements: string[]): PublicAuthUser {
  return publicUser(user, entitlements)
}

async function loadPublicUser(repo: AuthRepository, user: AuthUserRecord) {
  return normalizePublicUser(user, await resolveUserEntitlementKeys(repo, user.id))
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
    user: await loadPublicUser(repo, {
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
    user: await loadPublicUser(repo, {
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
    user: await loadPublicUser(repo, user),
  }
}

export async function redeemActivationCode(
  repo: AuthRepository,
  sessionToken: string | null | undefined,
  code: string,
  deps: AuthDeps = {},
): Promise<
  | { ok: true; user: PublicAuthUser }
  | { ok: false; error: AuthFailure }
> {
  const currentUser = await getCurrentUser(repo, sessionToken, deps)
  if (currentUser.ok === false) {
    return { ok: false, error: currentUser.error }
  }

  const normalizedCode = normalizeActivationCode(code)
  if (!normalizedCode) {
    return { ok: false, error: buildInvalidInput('Podaj kod aktywacyjny.') }
  }

  const existingEntitlements = currentUser.user.entitlements
  if (existingEntitlements.includes('charades_category_pack')) {
    return { ok: true, user: currentUser.user }
  }

  const activationCode = await repo.findActivationCodeByCode(normalizedCode)
  if (!activationCode || activationCode.entitlementKey !== 'charades_category_pack') {
    return { ok: false, error: buildInvalidInput('Nieprawidłowy kod aktywacyjny.') }
  }

  const redeemedAt = resolveNow(deps).toISOString()
  const redeemed = await repo.redeemActivationCode(normalizedCode, currentUser.user.id, redeemedAt)
  if (!redeemed) {
    return { ok: false, error: buildInvalidInput('Nieprawidłowy kod aktywacyjny.') }
  }

  return {
    ok: true,
    user: {
      ...currentUser.user,
      entitlements: [...currentUser.user.entitlements, activationCode.entitlementKey],
    },
  }
}

export async function createActivationCode(
  repo: AuthRepository,
  sessionToken: string | null | undefined,
  code: string,
  deps: AuthDeps = {},
): Promise<
  | { ok: true; user: PublicAuthUser; activationCode: ActivationCodeRecord }
  | { ok: false; error: AuthFailure }
> {
  const currentUser = await getCurrentUser(repo, sessionToken, deps)
  if (currentUser.ok === false) {
    return { ok: false, error: currentUser.error }
  }

  if (!currentUser.user.isAdmin) {
    return { ok: false, error: forbiddenError }
  }

  const normalizedCode = normalizeActivationCode(code)
  if (!normalizedCode) {
    return { ok: false, error: buildInvalidInput('Podaj kod aktywacyjny.') }
  }

  const existingActivationCode = await repo.findActivationCodeByCode(normalizedCode)
  if (existingActivationCode) {
    return { ok: false, error: activationCodeTakenError }
  }

  const nowIso = resolveNow(deps).toISOString()
  const activationCode: ActivationCodeRecord = {
    id: crypto.randomUUID(),
    code: normalizedCode,
    entitlementKey: 'charades_category_pack',
    createdAt: nowIso,
    redeemedByUserId: null,
    redeemedAt: null,
  }

  await repo.createActivationCode(activationCode)

  return {
    ok: true,
    user: currentUser.user,
    activationCode,
  }
}

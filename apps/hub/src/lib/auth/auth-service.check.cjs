const assert = require('node:assert/strict')
const path = require('node:path')

const modulePath = process.env.AUTH_SERVICE_MODULE_PATH || process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled auth service module path as first argument.')
}

const authService = require(path.resolve(process.cwd(), modulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

function createMemoryRepo() {
  const state = {
    users: [],
    sessions: [],
    activationCodes: [],
  }

  return {
    state,
    async findUserByEmail(email) {
      return state.users.find((user) => user.email === email) ?? null
    },
    async findUserById(id) {
      return state.users.find((user) => user.id === id) ?? null
    },
    async createUser(input) {
      const record = { ...input, lastLoginAt: null }
      state.users.push(record)
      return record
    },
    async touchUserLogin(userId, lastLoginAt) {
      const user = state.users.find((entry) => entry.id === userId)
      if (!user) return
      user.lastLoginAt = lastLoginAt
    },
    async createSession(input) {
      const record = { ...input, revokedAt: null }
      state.sessions.push(record)
      return record
    },
    async findSessionByTokenHash(tokenHash) {
      return state.sessions.find((session) => session.tokenHash === tokenHash && !session.revokedAt) ?? null
    },
    async revokeSessionByTokenHash(tokenHash, revokedAt) {
      const session = state.sessions.find((entry) => entry.tokenHash === tokenHash)
      if (!session) return
      session.revokedAt = revokedAt
    },
    async findActivationCodeByCode(code) {
      return state.activationCodes.find((activationCode) => activationCode.code === code) ?? null
    },
    async redeemActivationCode(code, userId, redeemedAt) {
      const activationCode = state.activationCodes.find((entry) => entry.code === code)
      if (!activationCode || activationCode.redeemedAt) return false
      activationCode.redeemedByUserId = userId
      activationCode.redeemedAt = redeemedAt
      return true
    },
    async createActivationCode(activationCode) {
      state.activationCodes.push({ ...activationCode })
      return activationCode
    },
    async listUserEntitlementKeys(userId) {
      return state.activationCodes
        .filter((activationCode) => activationCode.redeemedByUserId === userId && activationCode.redeemedAt)
        .map((activationCode) => activationCode.entitlementKey)
    },
  }
}

function createMemoryRepoWithoutActivationTable() {
  const repo = createMemoryRepo()
  repo.listUserEntitlementKeys = async () => {
    throw new Error('no such table: activation_codes')
  }
  return repo
}

function createDeps() {
  let tokenCounter = 0

  return {
    now: () => new Date('2026-04-12T12:00:00.000Z'),
    createSessionToken: () => `session-token-${++tokenCounter}`,
    hashPassword: async (password) => `hashed:${password}`,
    verifyPassword: async (password, hashedPassword) => hashedPassword === `hashed:${password}`,
  }
}

run('registering a fresh email creates a user and a session', async () => {
  const repo = createMemoryRepo()
  const result = await authService.registerAccount(
    repo,
    {
      email: '  Test@Example.com  ',
      displayName: '  Mati  ',
      password: 'super-secret',
    },
    createDeps(),
  )

  assert.equal(result.ok, true)
  if (!result.ok) throw new Error('Expected successful registration result.')
  assert.equal(result.user.email, 'test@example.com')
  assert.equal(result.user.displayName, 'Mati')
  assert.equal(result.user.isAdmin, false)
  assert.equal(result.sessionToken, 'session-token-1')
  assert.equal(repo.state.users.length, 1)
  assert.equal(repo.state.sessions.length, 1)
})

run('logging in with a bad password fails', async () => {
  const repo = createMemoryRepo()
  const deps = createDeps()

  await authService.registerAccount(
    repo,
    {
      email: 'test@example.com',
      displayName: 'Mati',
      password: 'super-secret',
    },
    deps,
  )

  const result = await authService.loginAccount(
    repo,
    {
      email: 'test@example.com',
      password: 'wrong-password',
    },
    deps,
  )

  assert.equal(result.ok, false)
  if (result.ok) throw new Error('Expected failed login result.')
  assert.equal(result.error.code, 'invalid_credentials')
})

run('logging out revokes the session', async () => {
  const repo = createMemoryRepo()
  const deps = createDeps()

  const registration = await authService.registerAccount(
    repo,
    {
      email: 'test@example.com',
      displayName: 'Mati',
      password: 'super-secret',
    },
    deps,
  )

  if (!registration.ok) throw new Error('Expected successful registration result.')

  const logout = await authService.logoutAccount(repo, registration.sessionToken, deps)
  assert.equal(logout.ok, true)
  assert.equal(repo.state.sessions[0].revokedAt, '2026-04-12T12:00:00.000Z')
})

run('me returns the current user when the session token is valid', async () => {
  const repo = createMemoryRepo()
  const deps = createDeps()

  const registration = await authService.registerAccount(
    repo,
    {
      email: 'test@example.com',
      displayName: 'Mati',
      password: 'super-secret',
    },
    deps,
  )

  if (!registration.ok) throw new Error('Expected successful registration result.')

  const me = await authService.getCurrentUser(repo, registration.sessionToken, deps)
  assert.equal(me.ok, true)
  if (!me.ok) throw new Error('Expected user lookup to succeed.')
  assert.equal(me.user.email, 'test@example.com')
  assert.equal(me.user.displayName, 'Mati')
  assert.equal(me.user.isAdmin, false)
})

run('bullet account is marked as admin', async () => {
  const repo = createMemoryRepo()
  const deps = createDeps()

  const registration = await authService.registerAccount(
    repo,
    {
      email: 'ciu.ciubiczys@gmail.com',
      displayName: 'Bullet',
      password: 'super-secret',
    },
    deps,
  )

  if (!registration.ok) throw new Error('Expected successful registration result.')

  assert.equal(registration.user.isAdmin, true)
})

run('auth still works when entitlement storage is unavailable', async () => {
  const repo = createMemoryRepoWithoutActivationTable()
  const deps = createDeps()

  const registration = await authService.registerAccount(
    repo,
    {
      email: 'test@example.com',
      displayName: 'Mati',
      password: 'super-secret',
    },
    deps,
  )

  assert.equal(registration.ok, true)
  if (!registration.ok) throw new Error('Expected successful registration result.')
  assert.deepEqual(registration.user.entitlements, [])

  const me = await authService.getCurrentUser(repo, registration.sessionToken, deps)
  assert.equal(me.ok, true)
  if (!me.ok) throw new Error('Expected user lookup to succeed.')
  assert.deepEqual(me.user.entitlements, [])
})

run('redeeming an activation code unlocks the account entitlement', async () => {
  const repo = createMemoryRepo()
  const deps = createDeps()

  const registration = await authService.registerAccount(
    repo,
    {
      email: 'test@example.com',
      displayName: 'Mati',
      password: 'super-secret',
    },
    deps,
  )

  if (!registration.ok) throw new Error('Expected successful registration result.')

  repo.state.activationCodes.push({
    code: 'KALAMBURY-START',
    entitlementKey: 'charades_category_pack',
    redeemedByUserId: null,
    redeemedAt: null,
  })

  const redeem = await authService.redeemActivationCode(repo, registration.sessionToken, '  kalambury-start  ', deps)
  assert.equal(redeem.ok, true)
  if (!redeem.ok) throw new Error('Expected activation code redemption to succeed.')
  assert.deepEqual(redeem.user.entitlements, ['charades_category_pack'])

  const me = await authService.getCurrentUser(repo, registration.sessionToken, deps)
  assert.equal(me.ok, true)
  if (!me.ok) throw new Error('Expected user lookup to succeed.')
  assert.deepEqual(me.user.entitlements, ['charades_category_pack'])
})

run('admin can create activation codes', async () => {
  const repo = createMemoryRepo()
  const deps = createDeps()

  const registration = await authService.registerAccount(
    repo,
    {
      email: 'ciu.ciubiczys@gmail.com',
      displayName: 'Bullet',
      password: 'super-secret',
    },
    deps,
  )

  if (!registration.ok) throw new Error('Expected successful registration result.')

  const created = await authService.createActivationCode(repo, registration.sessionToken, '  spring-2026  ', deps)
  assert.equal(created.ok, true)
  if (!created.ok) throw new Error('Expected activation code creation to succeed.')
  assert.equal(created.activationCode.code, 'SPRING-2026')
  assert.equal(created.activationCode.entitlementKey, 'charades_category_pack')
})

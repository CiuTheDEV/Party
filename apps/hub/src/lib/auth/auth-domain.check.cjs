const assert = require('node:assert/strict')
const path = require('node:path')

const modulePath = process.env.AUTH_DOMAIN_MODULE_PATH || process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled auth domain module path as first argument.')
}

const authDomain = require(path.resolve(process.cwd(), modulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('normalizes email addresses', () => {
  assert.equal(authDomain.normalizeEmail('  Test@Example.com  '), 'test@example.com')
})

run('rejects blank display names', () => {
  assert.equal(authDomain.normalizeDisplayName('   '), null)
})

run('enforces the password minimum length', () => {
  assert.equal(authDomain.validatePassword('short').ok, false)
  assert.equal(authDomain.validatePassword('long-enough').ok, true)
})

run('validates email format', () => {
  assert.equal(authDomain.validateEmail('not-an-email').ok, false)
  assert.equal(authDomain.validateEmail('test@example.com').ok, true)
})

run('builds a strict session cookie', () => {
  const cookie = authDomain.buildSessionCookie('session-token', new Date('2026-04-12T12:00:00.000Z'))

  assert.match(cookie, /^party_session=session-token;/)
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /Secure/i)
  assert.match(cookie, /SameSite=Lax/i)
  assert.match(cookie, /Path=\//i)
  assert.match(cookie, /Expires=/i)
})

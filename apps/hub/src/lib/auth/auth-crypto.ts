const textEncoder = new TextEncoder()

const PASSWORD_HASH_ITERATIONS = 20_000
const PASSWORD_HASH_BYTES = 32
const PASSWORD_SALT_BYTES = 16

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

async function derivePbkdf2Bits(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const saltBuffer = new Uint8Array(salt).buffer

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBuffer,
      iterations,
    },
    key,
    PASSWORD_HASH_BYTES * 8,
  )
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false
  }

  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index]
  }

  return diff === 0
}

export function createSessionToken() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)))
}

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(token))
  return toBase64Url(new Uint8Array(digest))
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES))
  const hash = new Uint8Array(await derivePbkdf2Bits(password, salt, PASSWORD_HASH_ITERATIONS))

  return [
    'pbkdf2-sha256',
    PASSWORD_HASH_ITERATIONS,
    toBase64Url(salt),
    toBase64Url(hash),
  ].join('$')
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, iterationsText, encodedSalt, encodedHashValue] = encodedHash.split('$')

  if (algorithm !== 'pbkdf2-sha256') {
    return false
  }

  const iterations = Number(iterationsText)
  if (!Number.isFinite(iterations) || iterations < 1) {
    return false
  }

  const salt = fromBase64Url(encodedSalt)
  const expected = fromBase64Url(encodedHashValue)
  const actual = new Uint8Array(await derivePbkdf2Bits(password, salt, iterations))

  return constantTimeEqual(actual, expected)
}

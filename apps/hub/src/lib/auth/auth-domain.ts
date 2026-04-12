export const SESSION_COOKIE_NAME = 'party_session'
export const PASSWORD_MIN_LENGTH = 8
export const SESSION_TTL_DAYS = 30
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
export const ADMIN_EMAIL = 'ciu.ciubiczys@gmail.com'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; code: string; message: string }

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function validateEmail(value: string): ValidationResult {
  const normalized = normalizeEmail(value)

  if (!EMAIL_RE.test(normalized)) {
    return {
      ok: false,
      code: 'invalid_email',
      message: 'Podaj poprawny adres e-mail.',
    }
  }

  return { ok: true, value: normalized }
}

export function normalizeDisplayName(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ')
  return normalized.length > 0 ? normalized : null
}

export function normalizeActivationCode(value: string) {
  return value.trim().toUpperCase()
}

export function isAdminEmail(value: string) {
  return normalizeEmail(value) === ADMIN_EMAIL
}

export function validatePassword(value: string): ValidationResult {
  if (value.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      code: 'password_too_short',
      message: `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków.`,
    }
  }

  return { ok: true, value }
}

export function createSessionExpiresAt(now = new Date()) {
  return new Date(now.getTime() + SESSION_TTL_MS)
}

export function buildSessionCookie(
  token: string,
  expiresAt: Date,
  options: { secure?: boolean } = {},
) {
  const secure = options.secure ?? true
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'HttpOnly',
    secure ? 'Secure' : null,
    'SameSite=Lax',
    'Path=/',
    `Expires=${expiresAt.toUTCString()}`,
    `Max-Age=${maxAgeSeconds}`,
  ].filter((part): part is string => part !== null)

  return parts.join('; ')
}

export function clearSessionCookie(options: { secure?: boolean } = {}) {
  const secure = options.secure ?? true
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    secure ? 'Secure' : null,
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
  ].filter((part): part is string => part !== null)

  return parts.join('; ')
}

export function readCookieValue(cookieHeader: string | null | undefined, name = SESSION_COOKIE_NAME) {
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

const DEFAULT_PARTYKIT_PORT = '1999'

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

export function getPartykitHost() {
  if (process.env.NEXT_PUBLIC_PARTYKIT_HOST) {
    return process.env.NEXT_PUBLIC_PARTYKIT_HOST
  }

  if (typeof window !== 'undefined' && window.location.hostname) {
    return `${window.location.hostname}:${DEFAULT_PARTYKIT_PORT}`
  }

  return `localhost:${DEFAULT_PARTYKIT_PORT}`
}

export function getPresenterOrigin() {
  if (process.env.NEXT_PUBLIC_PUBLIC_ORIGIN) {
    return process.env.NEXT_PUBLIC_PUBLIC_ORIGIN
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

export function isLocalPresenterOrigin(origin: string) {
  try {
    return isLoopbackHost(new URL(origin).hostname)
  } catch {
    return false
  }
}

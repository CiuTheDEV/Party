const DEFAULT_PARTYKIT_PORT = '1999'
const PRODUCTION_PARTYKIT_HOST = 'project-party.ciuthedev.partykit.dev'

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

type PartykitHostResolverParams = {
  envHost?: string
  windowHostname?: string
}

export function resolvePartykitHost({ envHost, windowHostname }: PartykitHostResolverParams) {
  if (envHost) {
    return envHost
  }

  if (windowHostname && isLoopbackHost(windowHostname)) {
    return `${windowHostname}:${DEFAULT_PARTYKIT_PORT}`
  }

  if (!windowHostname) {
    return `localhost:${DEFAULT_PARTYKIT_PORT}`
  }

  // Non-localhost without env var — use the production PartyKit host
  return PRODUCTION_PARTYKIT_HOST
}

export function getPartykitHost() {
  return resolvePartykitHost({
    envHost: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
    windowHostname: typeof window !== 'undefined' ? window.location.hostname : undefined,
  })
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

export function buildPresenterPath(roomId: string) {
  return `/games/charades/present/${encodeURIComponent(roomId)}`
}

export function buildPresenterUrl(origin: string, roomId: string) {
  return `${trimTrailingSlash(origin)}${buildPresenterPath(roomId)}`
}

export function isLocalPresenterOrigin(origin: string) {
  try {
    return isLoopbackHost(new URL(origin).hostname)
  } catch {
    return false
  }
}

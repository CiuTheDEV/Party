const DEFAULT_PARTYKIT_PORT = '1999'

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
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

  throw new Error(
    `Missing NEXT_PUBLIC_PARTYKIT_HOST for hostname "${windowHostname}". Set an explicit PartyKit host before using the production app.`,
  )
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

export function isLocalPresenterOrigin(origin: string) {
  try {
    return isLoopbackHost(new URL(origin).hostname)
  } catch {
    return false
  }
}

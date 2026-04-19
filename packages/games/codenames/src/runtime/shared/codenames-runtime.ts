const DEFAULT_PARTYKIT_PORT = '1999'
const PRODUCTION_PARTYKIT_HOST = 'project-party.ciuthedev.partykit.dev'

type CaptainRouteTeam = {
  name: string
  avatar: string
}

type CaptainRouteTeams = {
  redTeam: CaptainRouteTeam
  blueTeam: CaptainRouteTeam
}

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

  return PRODUCTION_PARTYKIT_HOST
}

export function getPartykitHost() {
  return resolvePartykitHost({
    envHost: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
    windowHostname: typeof window !== 'undefined' ? window.location.hostname : undefined,
  })
}

export function getPublicOrigin() {
  if (process.env.NEXT_PUBLIC_PUBLIC_ORIGIN) {
    return process.env.NEXT_PUBLIC_PUBLIC_ORIGIN
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

function appendCaptainTeamParams(params: URLSearchParams, teams?: CaptainRouteTeams) {
  if (!teams) {
    return
  }

  params.set('redName', teams.redTeam.name)
  params.set('redAvatar', teams.redTeam.avatar)
  params.set('blueName', teams.blueTeam.name)
  params.set('blueAvatar', teams.blueTeam.avatar)
}

export function buildCaptainPath(roomId: string, team?: 'red' | 'blue', teams?: CaptainRouteTeams) {
  const basePath = `/games/codenames/captain/${encodeURIComponent(roomId)}`
  const params = new URLSearchParams()

  if (!team) {
    appendCaptainTeamParams(params, teams)
    return params.size > 0 ? `${basePath}?${params.toString()}` : basePath
  }

  params.set('team', team)
  appendCaptainTeamParams(params, teams)
  return `${basePath}?${params.toString()}`
}

export function buildCaptainRoutePath(roomId: string, team?: 'red' | 'blue', teams?: CaptainRouteTeams) {
  const params = new URLSearchParams({ room: roomId })

  if (team) {
    params.set('team', team)
  }

  appendCaptainTeamParams(params, teams)

  return `/games/codenames/captain?${params.toString()}`
}

export function buildCaptainUrl(origin: string, roomId: string, teams?: CaptainRouteTeams) {
  return `${trimTrailingSlash(origin)}${buildCaptainPath(roomId, undefined, teams)}`
}

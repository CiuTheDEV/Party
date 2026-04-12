function normalizeAuthPath(path: string) {
  if (!path) {
    return ''
  }

  return path.startsWith('/') ? path : `/${path}`
}

export function getAuthApiUrl(path = '') {
  const suffix = normalizeAuthPath(path)

  if (typeof window !== 'undefined') {
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    if (isLocalHost) {
      return `${window.location.protocol}//${window.location.hostname}:8788/api/auth${suffix}`
    }
  }

  return `/api/auth${suffix}`
}

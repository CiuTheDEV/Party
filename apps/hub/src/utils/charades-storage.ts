import type {
  CharadesGameSettings,
  CharadesPlayerDraft,
  CharadesSelectedCategories,
} from '@party/charades'

const SETUP_STORAGE_KEY = 'charades:setup'
const PRESENTER_SESSION_STORAGE_KEY = 'charades:presenter-session'

const PRESENTER_HEARTBEAT_MS = 5000
const PRESENTER_SESSION_TTL_MS = 15000

export type StoredCharadesSetup = {
  roomId: string
  players: CharadesPlayerDraft[]
  selectedCategories: CharadesSelectedCategories
  settings: CharadesGameSettings
}

export type StoredPresenterSession = {
  roomId: string
  sessionId: string
  connected: boolean
  lastSeenAt: number
}

export function getPresenterHeartbeatMs() {
  return PRESENTER_HEARTBEAT_MS
}

export function isPresenterSessionFresh(session: StoredPresenterSession | null, roomId: string) {
  if (!session || !session.connected) {
    return false
  }

  if (session.roomId !== roomId) {
    return false
  }

  return Date.now() - session.lastSeenAt <= PRESENTER_SESSION_TTL_MS
}

export function createCharadesRoomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()
  }

  return Math.random().toString(36).slice(2, 12).toUpperCase()
}

export function readCharadesSetup() {
  return readJson<StoredCharadesSetup>(SETUP_STORAGE_KEY)
}

export function writeCharadesSetup(setup: StoredCharadesSetup) {
  writeJson(SETUP_STORAGE_KEY, setup)
}

export function readPresenterSession() {
  return readJson<StoredPresenterSession>(PRESENTER_SESSION_STORAGE_KEY)
}

export function writePresenterSession(session: StoredPresenterSession) {
  writeJson(PRESENTER_SESSION_STORAGE_KEY, session)
}

export function clearPresenterSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(PRESENTER_SESSION_STORAGE_KEY)
}

function readJson<T>(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

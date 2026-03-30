import type {
  CharadesGameSettings,
  CharadesPlayerDraft,
  CharadesSelectedCategories,
} from '../../setup/state'
import { createDefaultCharadesSettings } from '../../setup/state'
import { normalizeCharadesPlayers } from '../../avatars/avatar-helpers'
import type { StoredWordHistory } from './charades-word-history'
import { createEmptyWordHistory } from './charades-word-history'

const SETUP_STORAGE_KEY = 'charades:setup'
const PRESENTER_SESSION_STORAGE_KEY = 'charades:presenter-session'
const WORD_HISTORY_STORAGE_KEY = 'charades:word-history'

const PRESENTER_HEARTBEAT_MS = 5000
const PRESENTER_SESSION_TTL_MS = 15000
const WORD_HISTORY_SESSION_TTL_MS = 12 * 60 * 60 * 1000

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
  const stored = readJson<StoredCharadesSetup>(SETUP_STORAGE_KEY)
  if (!stored) {
    return null
  }

  return {
    ...stored,
    players: normalizeCharadesPlayers(stored.players),
    settings: normalizeCharadesSettings(stored.settings),
  }
}

export function writeCharadesSetup(setup: StoredCharadesSetup) {
  writeJson(SETUP_STORAGE_KEY, setup)
}

export function normalizeCharadesSettings(
  settings: Partial<CharadesGameSettings> | null | undefined,
): CharadesGameSettings {
  const defaults = createDefaultCharadesSettings()

  return {
    rounds: settings?.rounds ?? defaults.rounds,
    timerSeconds: settings?.timerSeconds ?? defaults.timerSeconds,
    wordChange: {
      enabled: settings?.wordChange?.enabled ?? defaults.wordChange.enabled,
      changesPerPlayer: settings?.wordChange?.changesPerPlayer ?? defaults.wordChange.changesPerPlayer,
      rerollScope: settings?.wordChange?.rerollScope ?? defaults.wordChange.rerollScope,
    },
  }
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

export function readCharadesWordHistory() {
  const stored = readJson<StoredWordHistory>(WORD_HISTORY_STORAGE_KEY)

  if (!stored) {
    return null
  }

  return {
    sessionId: stored.sessionId,
    usedPrompts: stored.usedPrompts ?? [],
    rejectedPromptsByPlayer: stored.rejectedPromptsByPlayer ?? {},
    lastUpdatedAt: stored.lastUpdatedAt ?? Date.now(),
  }
}

export function writeCharadesWordHistory(history: StoredWordHistory) {
  writeJson(WORD_HISTORY_STORAGE_KEY, history)
}

export function clearCharadesWordHistory() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(WORD_HISTORY_STORAGE_KEY)
}

export function ensureCharadesWordHistorySession() {
  const existing = readCharadesWordHistory()

  if (existing?.sessionId && !isWordHistoryStale(existing)) {
    return existing
  }

  return startNewCharadesWordHistorySession()
}

export function startNewCharadesWordHistorySession() {
  const nextHistory = createEmptyWordHistory(createWordHistorySessionId())
  writeCharadesWordHistory(nextHistory)
  return nextHistory
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

function createWordHistorySessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

function isWordHistoryStale(history: StoredWordHistory) {
  return Date.now() - history.lastUpdatedAt > WORD_HISTORY_SESSION_TTL_MS
}

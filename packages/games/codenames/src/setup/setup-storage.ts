import {
  createInitialCodenamesSetupState,
  CODENAMES_DEFAULT_AVATARS,
  type CodenamesSetupState,
} from './state'

export const CODENAMES_SETUP_STORAGE_KEY = 'codenames:setup'

type StoredTeam = {
  name?: unknown
  avatar?: unknown
}

type StoredSetupState = {
  roomId?: unknown
  teams?: unknown
  selectedCategories?: unknown
  settings?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeTeam(team: unknown, fallback: CodenamesSetupState['teams'][number], defaultAvatar: string) {
  const storedTeam = isRecord(team) ? (team as StoredTeam) : null

  return {
    name: typeof storedTeam?.name === 'string' && storedTeam.name.trim().length > 0 ? storedTeam.name : fallback.name,
    avatar: typeof storedTeam?.avatar === 'string' && storedTeam.avatar.trim().length > 0 ? storedTeam.avatar : defaultAvatar,
  }
}

function normalizeSelectedCategories(value: unknown, fallback: CodenamesSetupState['selectedCategories']) {
  if (!isRecord(value)) {
    return fallback
  }

  const selectedCategories = Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, true] => entry[1] === true),
  )

  return Object.keys(selectedCategories).length > 0 ? selectedCategories : fallback
}

function normalizeRounds(value: unknown, fallback: number) {
  if (!isRecord(value) || typeof value.rounds !== 'number' || !Number.isFinite(value.rounds)) {
    return fallback
  }

  return Math.max(1, Math.round(value.rounds))
}

export function restoreCodenamesSetupState(raw: string | null | undefined): CodenamesSetupState {
  const fallback = createInitialCodenamesSetupState()

  if (!raw) {
    return fallback
  }

  try {
    const parsed = JSON.parse(raw) as StoredSetupState

    const teams: CodenamesSetupState['teams'] = Array.isArray(parsed.teams) && parsed.teams.length >= 2
      ? [
          normalizeTeam(parsed.teams[0], fallback.teams[0], CODENAMES_DEFAULT_AVATARS[0]),
          normalizeTeam(parsed.teams[1], fallback.teams[1], CODENAMES_DEFAULT_AVATARS[1]),
        ]
      : fallback.teams

    return {
      roomId:
        typeof parsed.roomId === 'string' && parsed.roomId.trim().length === 8
          ? parsed.roomId.trim().toUpperCase()
          : fallback.roomId,
      teams,
      selectedCategories: normalizeSelectedCategories(parsed.selectedCategories, fallback.selectedCategories),
      settings: {
        rounds: normalizeRounds(parsed.settings, fallback.settings.rounds),
      },
      // Connection flags are runtime-only; restoring them would fake paired devices after reload.
      captainRedConnected: false,
      captainBlueConnected: false,
    }
  } catch {
    return fallback
  }
}

export function serializeCodenamesSetupState(state: CodenamesSetupState) {
  return JSON.stringify({
    roomId: state.roomId,
    teams: state.teams,
    selectedCategories: state.selectedCategories,
    settings: state.settings,
    captainRedConnected: state.captainRedConnected,
    captainBlueConnected: state.captainBlueConnected,
  })
}

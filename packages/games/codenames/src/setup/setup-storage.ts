import {
  createInitialCodenamesSetupState,
  CODENAMES_DEFAULT_AVATARS,
  CODENAMES_CATEGORY_IDS,
  type CodenamesCategoryBalance,
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
  categoryBalance?: unknown
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

  const knownCategoryIds = new Set<string>(CODENAMES_CATEGORY_IDS)
  const selectedCategories = Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, true] => entry[1] === true && knownCategoryIds.has(entry[0]),
    ),
  )

  return Object.keys(selectedCategories).length > 0 ? selectedCategories : fallback
}

function normalizeRounds(value: unknown, fallback: number) {
  if (!isRecord(value) || typeof value.rounds !== 'number' || !Number.isFinite(value.rounds)) {
    return fallback
  }

  return Math.max(1, Math.round(value.rounds))
}

function normalizeAssassins(
  value: unknown,
  fallback: CodenamesSetupState['settings']['assassins'],
): CodenamesSetupState['settings']['assassins'] {
  if (!isRecord(value) || !isRecord(value.assassins)) {
    return fallback
  }

  const count =
    typeof value.assassins.count === 'number' && Number.isFinite(value.assassins.count)
      ? Math.max(1, Math.min(4, Math.round(value.assassins.count)))
      : fallback.count

  return {
    enabled: value.assassins.enabled === true,
    count,
  }
}

function normalizeCategoryBalance(
  value: unknown,
  selectedCategories: Record<string, true>,
): CodenamesCategoryBalance | null {
  if (!isRecord(value)) {
    return null
  }

  const leftCategoryId = typeof value.leftCategoryId === 'string' ? value.leftCategoryId : ''
  const rightCategoryId = typeof value.rightCategoryId === 'string' ? value.rightCategoryId : ''
  const leftSharePercent =
    typeof value.leftSharePercent === 'number' && Number.isFinite(value.leftSharePercent)
      ? Math.round(value.leftSharePercent)
      : 50

  if (
    !selectedCategories[leftCategoryId] ||
    !selectedCategories[rightCategoryId] ||
    leftCategoryId === rightCategoryId
  ) {
    return null
  }

  return {
    leftCategoryId,
    rightCategoryId,
    leftSharePercent: Math.max(0, Math.min(100, leftSharePercent)),
  }
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

    const selectedCategories = normalizeSelectedCategories(parsed.selectedCategories, fallback.selectedCategories)

    return {
      roomId:
        typeof parsed.roomId === 'string' && parsed.roomId.trim().length === 8
          ? parsed.roomId.trim().toUpperCase()
          : fallback.roomId,
      teams,
      selectedCategories,
      settings: {
        rounds: normalizeRounds(parsed.settings, fallback.settings.rounds),
        assassins: normalizeAssassins(parsed.settings, fallback.settings.assassins),
      },
      categoryBalance: normalizeCategoryBalance(parsed.categoryBalance, selectedCategories),
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
    categoryBalance: state.categoryBalance,
  })
}

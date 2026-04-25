import type { GameSetupValidation } from '@party/game-sdk'

export const CODENAMES_CATEGORY_IDS = ['standard', 'plus18'] as const

export type CodenamesTeam = {
  name: string
  avatar: string
}

export type CodenamesGameSettings = {
  rounds: number
}

export type CodenamesCategoryBalance = {
  leftCategoryId: string
  rightCategoryId: string
  leftSharePercent: number
}

export type CodenamesSetupState = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  selectedCategories: Record<string, true>
  settings: CodenamesGameSettings
  categoryBalance: CodenamesCategoryBalance | null
  captainRedConnected: boolean
  captainBlueConnected: boolean
}

export const CODENAMES_DEFAULT_AVATARS = ['star', 'moon'] as const

function createCodenamesRoomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  }
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export function createInitialCodenamesSetupState(): CodenamesSetupState {
  return {
    roomId: createCodenamesRoomId(),
    teams: [
      { name: 'Czerwoni', avatar: CODENAMES_DEFAULT_AVATARS[0] },
      { name: 'Niebiescy', avatar: CODENAMES_DEFAULT_AVATARS[1] },
    ],
    selectedCategories: { standard: true },
    settings: { rounds: 3 },
    categoryBalance: null,
    captainRedConnected: false,
    captainBlueConnected: false,
  }
}

export function validateCodenamesSetup(state: CodenamesSetupState): GameSetupValidation {
  const errors: string[] = []
  const knownCategoryIds = new Set<string>(CODENAMES_CATEGORY_IDS)
  const selectedCategoryIds = Object.keys(state.selectedCategories).filter((categoryId) =>
    knownCategoryIds.has(categoryId),
  )

  if (selectedCategoryIds.length < 1) {
    errors.push('Wybierz przynajmniej jedną kategorię.')
  }

  if (!state.captainRedConnected || !state.captainBlueConnected) {
    errors.push('Połącz obu kapitanów przed startem gry.')
  }

  return {
    canStart: errors.length === 0,
    errors,
  }
}

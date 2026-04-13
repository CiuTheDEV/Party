import type { GameSetupValidation } from '@party/game-sdk'

export type CodenamesTeam = {
  name: string
  avatar: string
}

export type CodenamesGameSettings = {
  rounds: number
}

export type CodenamesSetupState = {
  teams: [CodenamesTeam, CodenamesTeam]
  selectedCategories: Record<string, true>
  settings: CodenamesGameSettings
}

export const CODENAMES_DEFAULT_AVATARS = ['star', 'moon'] as const

export function createInitialCodenamesSetupState(): CodenamesSetupState {
  return {
    teams: [
      { name: 'Czerwoni', avatar: CODENAMES_DEFAULT_AVATARS[0] },
      { name: 'Niebiescy', avatar: CODENAMES_DEFAULT_AVATARS[1] },
    ],
    selectedCategories: { standard: true, plus18: true },
    settings: { rounds: 3 },
  }
}

export function validateCodenamesSetup(state: CodenamesSetupState): GameSetupValidation {
  const errors: string[] = []

  if (Object.keys(state.selectedCategories).length < 1) {
    errors.push('Wybierz przynajmniej jedną kategorię.')
  }

  return {
    canStart: errors.length === 0,
    errors,
  }
}

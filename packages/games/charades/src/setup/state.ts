import type { GameSetupValidation } from '@party/game-sdk'

export type CharadesPlayerDraft = {
  name: string
  avatar: string
  gender: 'on' | 'ona' | 'none'
}

export type CharadesGameSettings = {
  rounds: number
  timerSeconds: number
}

export type CharadesCategoryDifficulty = 'easy' | 'hard'

export type CharadesSelectedCategories = Record<string, CharadesCategoryDifficulty[]>

export type CharadesSetupState = {
  roomId: string
  isDeviceConnected: boolean
  players: CharadesPlayerDraft[]
  selectedCategories: CharadesSelectedCategories
  settings: CharadesGameSettings
}

export function createInitialCharadesSetupState(): CharadesSetupState {
  return {
    roomId: '',
    isDeviceConnected: false,
    players: [],
    selectedCategories: {},
    settings: {
      rounds: 3,
      timerSeconds: 60,
    },
  }
}

export function validateCharadesSetup(state: CharadesSetupState): GameSetupValidation {
  const errors: string[] = []

  if (state.players.length < 2) {
    errors.push('Dodaj co najmniej 2 graczy.')
  }

  if (Object.keys(state.selectedCategories).length < 1) {
    errors.push('Wybierz przynajmniej jedną kategorię.')
  }

  if (!state.isDeviceConnected) {
    errors.push('Połącz urządzenie prezentera.')
  }

  return {
    canStart: errors.length === 0,
    errors,
  }
}

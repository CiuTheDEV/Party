import type { GameSetupValidation } from '@party/game-sdk'

export type CharadesPlayerDraft = {
  name: string
  avatar: CharadesAvatarId
  gender: 'on' | 'ona' | 'none'
}

export type CharadesAvatarId = string

export type CharadesGameSettings = {
  rounds: number
  timerSeconds: number
  wordChange: CharadesWordChangeSettings
  hints: CharadesHintsSettings
}

export type CharadesWordChangeScope = 'word-only' | 'word-and-category'

export type CharadesWordChangeSettings = {
  enabled: boolean
  changesPerPlayer: number
  rerollScope: CharadesWordChangeScope
}

export type CharadesHintsSettings = {
  enabled: boolean
  showCategory: boolean
  showWordCount: boolean
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

export function createDefaultCharadesSettings(): CharadesGameSettings {
  return {
    rounds: 3,
    timerSeconds: 60,
    wordChange: {
      enabled: false,
      changesPerPlayer: 1,
      rerollScope: 'word-only',
    },
    hints: {
      enabled: false,
      showCategory: true,
      showWordCount: true,
    },
  }
}

export function createInitialCharadesSetupState(): CharadesSetupState {
  return {
    roomId: '',
    isDeviceConnected: false,
    players: [],
    selectedCategories: {},
    settings: createDefaultCharadesSettings(),
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

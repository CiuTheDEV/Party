import type { GameModule, GameResultsProps, GameSetupValidation } from '@party/game-sdk'
import { config } from './config'

type CodenamesSetupState = {
  ready: boolean
}

function createInitialCodenamesSetupState(): CodenamesSetupState {
  return { ready: false }
}

function validateCodenamesSetup(_: CodenamesSetupState): GameSetupValidation {
  return {
    canStart: false,
    errors: ['Codenames setup is not implemented yet.'],
  }
}

function CodenamesMenuPlaceholder() {
  return null
}

function CodenamesResultsPlaceholder(_: GameResultsProps) {
  return null
}

export const codenamesModule: GameModule<CodenamesSetupState> = {
  config,
  shell: {
    gameName: 'Codenames',
    gameEmoji: '\u{1F575}\uFE0F',
    links: [
      { label: 'Menu gry', href: '/games/codenames', icon: 'play', disabled: true },
      { label: 'Ustawienia', href: '/games/codenames/settings', icon: 'settings', disabled: true },
    ],
  },
  createInitialSetupState: createInitialCodenamesSetupState,
  setupSections: [],
  validateSetup: validateCodenamesSetup,
  GameMenuContent: CodenamesMenuPlaceholder,
  GameResults: CodenamesResultsPlaceholder,
}

export { config, createInitialCodenamesSetupState, validateCodenamesSetup }
export type { CodenamesSetupState }

import type { ComponentType } from 'react'
import type { GameConfig, GameShellConfig } from './GameConfig'
import type {
  GameMenuContentProps,
  GameSetupSection,
  GameSetupValidation,
} from './GameSetup'

export type GameResultsProps = {
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export type GameModule<TSetupState = unknown, TSetupHelpers = undefined> = {
  config: GameConfig
  shell: GameShellConfig
  createInitialSetupState: () => TSetupState
  setupSections: GameSetupSection<TSetupState, TSetupHelpers>[]
  validateSetup: (state: TSetupState) => GameSetupValidation
  GameMenuContent: ComponentType<GameMenuContentProps>
  GameResults: ComponentType<GameResultsProps>
}

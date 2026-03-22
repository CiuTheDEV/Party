import type { ComponentType } from 'react'
import type { GameConfig } from './GameConfig'

export type GameResultsProps = {
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export type GameModule = {
  config: GameConfig
  GameMenu: ComponentType
  GameSetup: ComponentType
  GameResults: ComponentType<GameResultsProps>
}

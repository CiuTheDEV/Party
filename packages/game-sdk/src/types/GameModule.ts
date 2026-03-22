import type { ComponentType } from 'react'
import type { GameConfig } from './GameConfig'

export type GameConfigModalProps = {
  onClose: () => void
  onStart: () => void
}

export type GameResultsProps = {
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export type GameModule = {
  config: GameConfig
  GameMenu: ComponentType
  GameConfigModal: ComponentType<GameConfigModalProps>
  GameResults: ComponentType<GameResultsProps>
}

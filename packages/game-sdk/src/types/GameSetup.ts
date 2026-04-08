import type { ComponentType, ReactNode } from 'react'

export type GameSetupValidation = {
  canStart: boolean
  errors?: string[]
}

export type GameSetupStateUpdater<TState> = (recipe: (current: TState) => TState) => void

export type GameSetupContext<TState, THelpers = undefined> = {
  state: TState
  updateState: GameSetupStateUpdater<TState>
  validation: GameSetupValidation
  helpers: THelpers
}

export type GameSetupSectionComponentProps<TState, THelpers = undefined> = GameSetupContext<TState, THelpers>

export type GameSetupSection<TState, THelpers = undefined> = {
  id: string
  title?: string
  description?: string
  render: ComponentType<GameSetupSectionComponentProps<TState, THelpers>>
  className?: string
  unstyled?: boolean
}

export type GameMenuContentProps = {
  onOpenSetup: () => void
}

export type GameSetupTemplateProps<TState> = {
  title: string
  subtitle?: string
  sections: Array<{
    id: string
    title?: string
    description?: string
    content: ReactNode
    className?: string
    unstyled?: boolean
  }>
  validation: GameSetupValidation
  onStart: () => void
  onClose: () => void
  startLabel?: string
  isFocusVisible?: boolean
  focusedAction?: 'close' | 'start' | null
}

import type { ComponentType } from 'react'
import type { GameWordCategory } from '@party/game-sdk'
import type { CodenamesTeam } from './state'

export type CodenamesWordCategory = GameWordCategory

export type CaptainListenerProps = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  onRedConnect: () => void
  onRedDisconnect: () => void
  onBlueConnect: () => void
  onBlueDisconnect: () => void
}

export type CodenamesSetupHelpers = {
  categories: CodenamesWordCategory[]
  categoryPoolSummaries: Array<{
    categoryId: string
    name: string
    total: number
    remaining: number
    isExhausted: boolean
    isSelected: boolean
  }>
  CaptainListener: ComponentType<CaptainListenerProps>
  poolSummary: {
    poolKey: string
    total: number
    remaining: number
    isExhausted: boolean
  }
  resetActivePoolHistory: () => void
  resetCategoryPoolHistory: (categoryId: string) => void
}

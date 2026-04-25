import type { ComponentType } from 'react'
import type { GameWordCategory } from '@party/game-sdk'
import type { CodenamesTeam } from './state'
import type { PartialCaptainConnectionState } from './captain-connection-state'

export type CodenamesWordCategory = GameWordCategory

export type CaptainListenerProps = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  onConnectionStateChange: (state: PartialCaptainConnectionState) => void
  pendingDeviceAction?:
    | {
        type: 'disconnect-devices' | 'session-code-change'
        nextRoomId: string
      }
    | null
  onDeviceActionSent?: (action: { type: 'disconnect-devices' | 'session-code-change'; nextRoomId: string }) => void
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
  isPairingModalOpen: boolean
  poolSummary: {
    poolKey: string
    total: number
    remaining: number
    isExhausted: boolean
  }
  resetActivePoolHistory: () => void
  resetCategoryPoolHistory: (categoryId: string) => void
  disconnectCaptainDevices: () => void
  regenerateSessionCode: () => void
  openPairingModal: () => void
  closePairingModal: () => void
}

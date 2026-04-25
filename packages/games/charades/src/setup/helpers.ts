import type { ComponentType } from 'react'

export type CharadesWordCategory = {
  id: string
  name: string
  wordsEasy: string[]
  wordsHard: string[]
}

export type CharadesDeviceListenerProps = {
  roomId: string
  onConnect: () => void
  onDisconnect: () => void
  pendingDeviceAction?:
    | {
        type: 'disconnect-devices' | 'session-code-change'
        nextRoomId: string
      }
    | null
  onDeviceActionSent?: (action: { type: 'disconnect-devices' | 'session-code-change'; nextRoomId: string }) => void
}

export type CharadesSetupHelpers = {
  categories: CharadesWordCategory[]
  DeviceListener: ComponentType<CharadesDeviceListenerProps>
  isPairingModalOpen: boolean
  onDisconnectDevice: () => void
  onRegenerateSessionCode: () => void
  openPairingModal: () => void
  closePairingModal: () => void
  hasCategoryAccess: (categoryId: string) => boolean
  redeemActivationCode: (code: string) => Promise<void>
}

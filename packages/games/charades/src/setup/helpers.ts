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
}

export type CharadesSetupHelpers = {
  categories: CharadesWordCategory[]
  DeviceListener: ComponentType<CharadesDeviceListenerProps>
  onDisconnectDevice: () => void
}

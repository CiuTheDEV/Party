import type { ComponentType } from 'react'
import type { GameWordCategory } from '@party/game-sdk'

export type CodenamesWordCategory = GameWordCategory

export type CaptainListenerProps = {
  roomId: string
  onRedConnect: () => void
  onRedDisconnect: () => void
  onBlueConnect: () => void
  onBlueDisconnect: () => void
}

export type CodenamesSetupHelpers = {
  categories: CodenamesWordCategory[]
  CaptainListener: ComponentType<CaptainListenerProps>
}

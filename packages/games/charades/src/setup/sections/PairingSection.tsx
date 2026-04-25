'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CharadesSetupHelpers } from '../helpers'
import type { CharadesSetupState } from '../state'
import { PairingPanel } from '../components/PairingPanel'

export function PairingSection({
  state,
  helpers,
}: GameSetupSectionComponentProps<CharadesSetupState, CharadesSetupHelpers>) {
  return (
    <PairingPanel
      roomId={state.roomId}
      isConnected={state.isDeviceConnected}
      isModalOpen={helpers.isPairingModalOpen}
      onDisconnect={helpers.onDisconnectDevice}
      onRegenerateSessionCode={helpers.onRegenerateSessionCode}
      onOpenModal={helpers.openPairingModal}
      onCloseModal={helpers.closePairingModal}
    />
  )
}

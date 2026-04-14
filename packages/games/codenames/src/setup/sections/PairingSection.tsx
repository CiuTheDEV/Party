'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupState } from '../state'
import type { CodenamesSetupHelpers } from '../helpers'
import { CaptainPairingPanel } from '../components/CaptainPairingPanel'

type Props = GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>

export function PairingSection({ state, updateState, helpers }: Props) {
  const CaptainListenerComponent = helpers.CaptainListener

  return (
    <>
      <CaptainListenerComponent
        roomId={state.roomId}
        onRedConnect={() => updateState((s) => ({ ...s, captainRedConnected: true }))}
        onRedDisconnect={() => updateState((s) => ({ ...s, captainRedConnected: false }))}
        onBlueConnect={() => updateState((s) => ({ ...s, captainBlueConnected: true }))}
        onBlueDisconnect={() => updateState((s) => ({ ...s, captainBlueConnected: false }))}
      />
      <CaptainPairingPanel
        roomId={state.roomId}
        captainRedConnected={state.captainRedConnected}
        captainBlueConnected={state.captainBlueConnected}
      />
    </>
  )
}

'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CharadesSetupHelpers } from '../helpers'
import type { CharadesSetupState } from '../state'
import { PairingPanel } from '../components/PairingPanel'

export function PairingSection({
  state,
  updateState,
  helpers,
}: GameSetupSectionComponentProps<CharadesSetupState, CharadesSetupHelpers>) {
  const DeviceListener = helpers.DeviceListener

  return (
    <>
      {state.roomId ? (
        <DeviceListener
          roomId={state.roomId}
          onConnect={() => updateState((current) => ({ ...current, isDeviceConnected: true }))}
          onDisconnect={() => updateState((current) => ({ ...current, isDeviceConnected: false }))}
        />
      ) : null}
      <PairingPanel
        roomId={state.roomId}
        isConnected={state.isDeviceConnected}
        onDisconnect={helpers.onDisconnectDevice}
      />
    </>
  )
}

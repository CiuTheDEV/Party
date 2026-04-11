'use client'

import { useCallback } from 'react'
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

  const handleConnect = useCallback(() => {
    updateState((current) => ({ ...current, isDeviceConnected: true }))
  }, [updateState])

  const handleDisconnect = useCallback(() => {
    updateState((current) => ({ ...current, isDeviceConnected: false }))
  }, [updateState])

  return (
    <>
      {state.roomId ? (
        <DeviceListener
          roomId={state.roomId}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
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

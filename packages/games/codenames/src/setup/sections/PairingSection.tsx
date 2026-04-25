'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupState } from '../state'
import type { CodenamesSetupHelpers } from '../helpers'
import { CaptainPairingPanel } from '../components/CaptainPairingPanel'

type Props = GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>

export function PairingSection({ state, updateState, helpers }: Props) {
  return (
    <CaptainPairingPanel
      roomId={state.roomId}
      teams={state.teams}
      captainRedConnected={state.captainRedConnected}
      captainBlueConnected={state.captainBlueConnected}
    />
  )
}

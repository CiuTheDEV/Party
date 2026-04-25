import type { RoomState } from '../runtime/shared/codenames-events'

export type CaptainConnectionState = {
  captainRedConnected: boolean
  captainBlueConnected: boolean
}

export type PartialCaptainConnectionState = {
  captainRedConnected?: boolean
  captainBlueConnected?: boolean
}

export function getCaptainConnectionState(roomState: Pick<RoomState, 'captainRedConnected' | 'captainBlueConnected'>): CaptainConnectionState {
  return {
    captainRedConnected: roomState.captainRedConnected,
    captainBlueConnected: roomState.captainBlueConnected,
  }
}

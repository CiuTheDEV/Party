'use client'

import { useEffect, useRef } from 'react'
import PartySocket from 'partysocket'
import { getPartykitHost } from '../shared/codenames-runtime'
import type { HostEvent, IncomingMessage } from '../shared/codenames-events'
import type { CodenamesTeam } from '../../setup/state'
import { getCaptainConnectionState, type PartialCaptainConnectionState } from '../../setup/captain-connection-state'

type Props = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  onConnectionStateChange: (state: PartialCaptainConnectionState) => void
}

export default function CaptainListener({ roomId, teams, onConnectionStateChange }: Props) {
  const onConnectionStateChangeRef = useRef(onConnectionStateChange)

  useEffect(() => { onConnectionStateChangeRef.current = onConnectionStateChange }, [onConnectionStateChange])

  useEffect(() => {
    if (!roomId) return

    const host = getPartykitHost()
    const ws = new PartySocket({ host, room: roomId, party: 'codenames' })

    ws.addEventListener('open', () => {
      ws.send(
        JSON.stringify({
          type: 'HOST_SETUP_CONNECTED',
          redTeam: teams[0],
          blueTeam: teams[1],
        } satisfies HostEvent),
      )
    })

    ws.addEventListener('message', (event: MessageEvent) => {
      const msg = JSON.parse(event.data) as IncomingMessage

      if (msg.type === 'ROOM_STATE') {
        onConnectionStateChangeRef.current(getCaptainConnectionState(msg.state))
        return
      }

      if (msg.type === 'CAPTAIN_CONNECTED') {
        onConnectionStateChangeRef.current(
          msg.team === 'red'
            ? { captainRedConnected: true }
            : { captainBlueConnected: true },
        )
        return
      }

      if (msg.type === 'CAPTAIN_DISCONNECTED') {
        onConnectionStateChangeRef.current(
          msg.team === 'red'
            ? { captainRedConnected: false }
            : { captainBlueConnected: false },
        )
      }
    })

    return () => ws.close()
  }, [roomId, teams])

  return null
}

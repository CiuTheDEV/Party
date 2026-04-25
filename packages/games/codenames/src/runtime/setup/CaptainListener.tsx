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
  pendingDeviceAction?:
    | {
        type: 'disconnect-devices' | 'session-code-change'
        nextRoomId: string
      }
    | null
  onDeviceActionSent?: (action: { type: 'disconnect-devices' | 'session-code-change'; nextRoomId: string }) => void
}

export default function CaptainListener({
  roomId,
  teams,
  onConnectionStateChange,
  pendingDeviceAction,
  onDeviceActionSent,
}: Props) {
  const onConnectionStateChangeRef = useRef(onConnectionStateChange)
  const onDeviceActionSentRef = useRef(onDeviceActionSent)
  const pendingDeviceActionRef = useRef<
    | {
        type: 'disconnect-devices' | 'session-code-change'
        nextRoomId: string
      }
    | null
  >(pendingDeviceAction ?? null)
  const lastSentActionKeyRef = useRef<string | null>(null)
  const socketRef = useRef<PartySocket | null>(null)

  useEffect(() => { onConnectionStateChangeRef.current = onConnectionStateChange }, [onConnectionStateChange])
  useEffect(() => { onDeviceActionSentRef.current = onDeviceActionSent }, [onDeviceActionSent])
  useEffect(() => {
    pendingDeviceActionRef.current = pendingDeviceAction ?? null

    if (!pendingDeviceAction) {
      lastSentActionKeyRef.current = null
      return
    }

    flushPendingDeviceAction()
  }, [pendingDeviceAction])

  function flushPendingDeviceAction() {
    const action = pendingDeviceActionRef.current
    const socket = socketRef.current

    if (
      !action ||
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      lastSentActionKeyRef.current === `${action.type}:${action.nextRoomId}`
    ) {
      return
    }

    socket.send(
      JSON.stringify({
        ...(action.type === 'disconnect-devices'
          ? { type: 'DEVICES_DISCONNECTED' as const }
          : { type: 'SESSION_CODE_CHANGED' as const, nextRoomId: action.nextRoomId }),
      } satisfies HostEvent),
    )
    lastSentActionKeyRef.current = `${action.type}:${action.nextRoomId}`
    onDeviceActionSentRef.current?.(action)
  }

  useEffect(() => {
    if (!roomId) return

    const host = getPartykitHost()
    const ws = new PartySocket({ host, room: roomId, party: 'codenames' })
    socketRef.current = ws

    ws.addEventListener('open', () => {
      ws.send(
        JSON.stringify({
          type: 'HOST_SETUP_CONNECTED',
          redTeam: teams[0],
          blueTeam: teams[1],
        } satisfies HostEvent),
      )
      flushPendingDeviceAction()
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

    return () => {
      if (socketRef.current === ws) {
        socketRef.current = null
      }

      ws.close()
    }
  }, [roomId, teams])

  return null
}

'use client'

import { useEffect, useRef } from 'react'
import PartySocket from 'partysocket'
import { getPartykitHost } from '../shared/charades-runtime'

export default function DeviceListener({
  roomId,
  onConnect,
  onDisconnect,
  pendingDeviceAction,
  onDeviceActionSent,
}: {
  roomId: string
  onConnect: () => void
  onDisconnect: () => void
  pendingDeviceAction?:
    | {
        type: 'disconnect-devices' | 'session-code-change'
        nextRoomId: string
      }
    | null
  onDeviceActionSent?: (action: { type: 'disconnect-devices' | 'session-code-change'; nextRoomId: string }) => void
}) {
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)
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

  useEffect(() => { onConnectRef.current = onConnect }, [onConnect])
  useEffect(() => { onDisconnectRef.current = onDisconnect }, [onDisconnect])
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
      JSON.stringify(
        action.type === 'disconnect-devices'
          ? { type: 'DEVICES_DISCONNECTED' }
          : { type: 'SESSION_CODE_CHANGED', nextRoomId: action.nextRoomId },
      ),
    )
    lastSentActionKeyRef.current = `${action.type}:${action.nextRoomId}`
    onDeviceActionSentRef.current?.(action)
  }

  useEffect(() => {
    if (!roomId) return

    const host = getPartykitHost()
    const ws = new PartySocket({ host, room: roomId })
    socketRef.current = ws

    ws.addEventListener('open', () => {
      flushPendingDeviceAction()
    })

    ws.addEventListener('message', (event: MessageEvent) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'ROOM_STATE') {
        if (msg.state?.presenterConnected === true) {
          onConnectRef.current()
        } else {
          onDisconnectRef.current()
        }
        return
      }

      if (msg.type === 'DEVICE_CONNECTED') {
        onConnectRef.current()
        return
      }

      if (msg.type === 'PRESENTER_DISCONNECTED') {
        onDisconnectRef.current()
      }
    })

    return () => {
      if (socketRef.current === ws) {
        socketRef.current = null
      }

      ws.close()
    }
  }, [roomId])

  return null
}

'use client'

import { useEffect, useRef } from 'react'
import PartySocket from 'partysocket'
import { getPartykitHost } from '../shared/charades-runtime'

export default function DeviceListener({
  roomId,
  onConnect,
  onDisconnect,
}: {
  roomId: string
  onConnect: () => void
  onDisconnect: () => void
}) {
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)

  useEffect(() => { onConnectRef.current = onConnect }, [onConnect])
  useEffect(() => { onDisconnectRef.current = onDisconnect }, [onDisconnect])

  useEffect(() => {
    if (!roomId) return

    const host = getPartykitHost()
    const ws = new PartySocket({ host, room: roomId })

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
      ws.close()
    }
  }, [roomId])

  return null
}

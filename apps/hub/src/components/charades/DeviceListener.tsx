'use client'

import { useEffect } from 'react'
import PartySocket from 'partysocket'

export default function DeviceListener({
  roomId,
  onConnect,
}: {
  roomId: string
  onConnect: () => void
}) {
  useEffect(() => {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999'
    const ws = new PartySocket({ host, room: roomId })
    ws.addEventListener('message', (event: MessageEvent) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'DEVICE_CONNECTED') onConnect()
    })
    return () => ws.close()
  }, [roomId, onConnect])
  return null
}

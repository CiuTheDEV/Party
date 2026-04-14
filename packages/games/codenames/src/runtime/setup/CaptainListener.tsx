'use client'

import { useEffect, useRef } from 'react'
import PartySocket from 'partysocket'
import { getPartykitHost } from '../shared/codenames-runtime'

type Props = {
  roomId: string
  onRedConnect: () => void
  onRedDisconnect: () => void
  onBlueConnect: () => void
  onBlueDisconnect: () => void
}

export default function CaptainListener({ roomId, onRedConnect, onRedDisconnect, onBlueConnect, onBlueDisconnect }: Props) {
  const onRedConnectRef = useRef(onRedConnect)
  const onRedDisconnectRef = useRef(onRedDisconnect)
  const onBlueConnectRef = useRef(onBlueConnect)
  const onBlueDisconnectRef = useRef(onBlueDisconnect)

  useEffect(() => { onRedConnectRef.current = onRedConnect }, [onRedConnect])
  useEffect(() => { onRedDisconnectRef.current = onRedDisconnect }, [onRedDisconnect])
  useEffect(() => { onBlueConnectRef.current = onBlueConnect }, [onBlueConnect])
  useEffect(() => { onBlueDisconnectRef.current = onBlueDisconnect }, [onBlueDisconnect])

  useEffect(() => {
    if (!roomId) return

    const host = getPartykitHost()
    const ws = new PartySocket({ host, room: roomId, party: 'codenames' })

    ws.addEventListener('message', (event: MessageEvent) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'ROOM_STATE') {
        if (msg.state?.captainRedConnected) onRedConnectRef.current()
        else onRedDisconnectRef.current()
        if (msg.state?.captainBlueConnected) onBlueConnectRef.current()
        else onBlueDisconnectRef.current()
        return
      }

      if (msg.type === 'CAPTAIN_CONNECTED') {
        if (msg.team === 'red') onRedConnectRef.current()
        else onBlueConnectRef.current()
        return
      }

      if (msg.type === 'CAPTAIN_DISCONNECTED') {
        if (msg.team === 'red') onRedDisconnectRef.current()
        else onBlueDisconnectRef.current()
      }
    })

    return () => ws.close()
  }, [roomId])

  return null
}

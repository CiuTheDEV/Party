'use client'

import { useEffect, useRef } from 'react'
import PartySocket from 'partysocket'
import { getPartykitHost } from '../shared/charades-runtime'
import {
  isPresenterSessionFresh,
  readPresenterSession,
} from '../shared/charades-storage'

export default function DeviceListener({
  roomId,
  onConnect,
  onDisconnect,
}: {
  roomId: string
  onConnect: () => void
  onDisconnect: () => void
}) {
  const isConnectedRef = useRef(false)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)

  useEffect(() => {
    onConnectRef.current = onConnect
  }, [onConnect])

  useEffect(() => {
    onDisconnectRef.current = onDisconnect
  }, [onDisconnect])

  useEffect(() => {
    if (!roomId) {
      isConnectedRef.current = false
      onDisconnectRef.current()
      return
    }

    const syncConnectionState = () => {
      const nextConnected = isPresenterSessionFresh(readPresenterSession(), roomId)

      if (nextConnected === isConnectedRef.current) {
        return
      }

      isConnectedRef.current = nextConnected

      if (nextConnected) {
        onConnectRef.current()
        return
      }

      onDisconnectRef.current()
    }

    syncConnectionState()

    const host = getPartykitHost()
    const ws = new PartySocket({ host, room: roomId })
    const handleMessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'DEVICE_CONNECTED') {
        isConnectedRef.current = true
        onConnectRef.current()
      }
      if (msg.type === 'ROOM_STATE' && msg.state?.presenterConnected === true && !isConnectedRef.current) {
        isConnectedRef.current = true
        onConnectRef.current()
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'charades:presenter-session') {
        syncConnectionState()
      }
    }

    const poll = window.setInterval(syncConnectionState, 2000)

    ws.addEventListener('message', handleMessage)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.clearInterval(poll)
      window.removeEventListener('storage', handleStorage)
      ws.removeEventListener('message', handleMessage)
      ws.close()
    }
  }, [roomId])
  return null
}

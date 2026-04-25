import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import usePartySocket from 'partysocket/react'
import type { PresenterConnectionState, PresenterViewState } from '../presenter/types'
import type { HostEvent, PresenterEvent, RoomStateMessage } from '../shared/charades-events'
import { getPartykitHost } from '../shared/charades-runtime'
import {
  clearPresenterSession,
  getPresenterHeartbeatMs,
  readPresenterSession,
  writePresenterSession,
} from '../shared/charades-storage'
import { INITIAL_PRESENTER_STATE, applyPresenterHostEvent, mapRoomStateToPresenterView } from './presenter-state'

export function usePresenter(roomId: string) {
  const sessionId = useMemo(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }

    return Math.random().toString(36).slice(2)
  }, [])

  const hasSyncedStateRef = useRef(false)
  const slotTakenRef = useRef(false)
  const [state, setState] = useState<PresenterViewState>(INITIAL_PRESENTER_STATE)
  const [connectionState, setConnectionState] = useState<PresenterConnectionState>('connecting')

  const writeHeartbeat = useCallback((connected = true) => {
    if (!roomId) {
      return
    }

    writePresenterSession({
      roomId,
      sessionId,
      connected,
      lastSeenAt: Date.now(),
    })
  }, [roomId, sessionId])

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    onOpen() {
      writeHeartbeat()
      setConnectionState('connected')
      const event: PresenterEvent = { type: 'DEVICE_CONNECTED' }
      socket.send(JSON.stringify(event))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as HostEvent | RoomStateMessage

      if (slotTakenRef.current && msg.type !== 'PRESENTER_SLOT_TAKEN') {
        return
      }

      hasSyncedStateRef.current = true
      setConnectionState('connected')

      if (msg.type === 'ROOM_STATE') {
        setState(mapRoomStateToPresenterView(msg.state))
        return
      }

      if (msg.type === 'PRESENTER_SLOT_TAKEN') {
        slotTakenRef.current = true
      }

      handleHostEvent(msg as HostEvent)
    },
    onError() {
      writeHeartbeat(false)
      setConnectionState('error')
    },
    onClose() {
      writeHeartbeat(false)
      setConnectionState((current) => {
        if (slotTakenRef.current) {
          return 'connected'
        }

        if (current === 'error') {
          return current
        }

        return hasSyncedStateRef.current ? 'reconnecting' : 'connecting'
      })
    },
  })

  useEffect(() => {
    if (!roomId) {
      return
    }

    writeHeartbeat()

    const interval = window.setInterval(() => writeHeartbeat(connectionState === 'connected'), getPresenterHeartbeatMs())

    return () => {
      window.clearInterval(interval)
      const session = readPresenterSession()

      if (session?.sessionId === sessionId) {
        clearPresenterSession()
      }
    }
  }, [connectionState, roomId, sessionId, writeHeartbeat])

  function handleHostEvent(event: HostEvent) {
    setState((current) => applyPresenterHostEvent(current, event))
  }

  const revealWord = useCallback(() => {
    if (!state.currentTurnId || connectionState !== 'connected') {
      return false
    }

    const event: PresenterEvent = { type: 'WORD_REVEALED', turnId: state.currentTurnId }
    try {
      socket.send(JSON.stringify(event))
      return true
    } catch {
      setConnectionState('error')
      return false
    }
  }, [connectionState, state.currentTurnId, socket])

  const changeWord = useCallback(() => {
    if (
      !state.currentTurnId ||
      state.phase !== 'reveal-buffer' ||
      !state.canChangeWord ||
      state.remainingWordChanges <= 0 ||
      connectionState !== 'connected'
    ) {
      return false
    }

    const event: PresenterEvent = { type: 'CHANGE_WORD', turnId: state.currentTurnId }

    try {
      socket.send(JSON.stringify(event))
      return true
    } catch {
      setConnectionState('error')
      return false
    }
  }, [connectionState, state.canChangeWord, state.currentTurnId, state.phase, state.remainingWordChanges, socket])

  return {
    state,
    connectionState,
    hasSyncedState: hasSyncedStateRef.current,
    revealWord,
    changeWord,
  }
}

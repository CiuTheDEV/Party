'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  detectGamepadProfile,
  formatControllerLabelForProfile,
  getCurrentGamepadInputLabel,
  listConnectedGamepads,
  pickPreferredGamepad,
} from './charades-controls-bindings'
import {
  areConnectedGamepadOptionsEqual,
  areGamepadDebugStatesEqual,
  type ConnectedGamepadOption,
  type GamepadDebugState,
} from './charades-settings-overlay-helpers'

type PopupPosition = {
  x: number
  y: number
}

type DragState = {
  pointerId: number
  offsetX: number
  offsetY: number
}

type Options = {
  isPadView: boolean
}

const DEFAULT_DEBUG_POSITION: PopupPosition = { x: 24, y: 24 }

export function useSettingsGamepadDebug({ isPadView }: Options) {
  const [gamepadDebug, setGamepadDebug] = useState<GamepadDebugState>({
    connected: false,
    id: '',
    index: null,
    buttons: 0,
    axes: 0,
    currentInput: null,
  })
  const [connectedGamepads, setConnectedGamepads] = useState<ConnectedGamepadOption[]>([])
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number | null>(null)
  const [isDebugOpen, setIsDebugOpen] = useState(false)
  const [debugPopupPosition, setDebugPopupPosition] = useState<PopupPosition>(DEFAULT_DEBUG_POSITION)
  const dragStateRef = useRef<DragState | null>(null)

  useEffect(() => {
    if (!isPadView) {
      setIsDebugOpen(false)
      setGamepadDebug((current) => {
        const nextState = {
          connected: false,
          id: '',
          index: null,
          buttons: 0,
          axes: 0,
          currentInput: null,
        }

        return areGamepadDebugStatesEqual(current, nextState) ? current : nextState
      })
      setConnectedGamepads((current) => (current.length === 0 ? current : []))
      setSelectedGamepadIndex((current) => (current === null ? current : null))
      return
    }

    let frameId = 0

    const tick = () => {
      const availableGamepads = listConnectedGamepads()
      const nextConnectedGamepads = availableGamepads.map((gamepad) => ({
        index: gamepad.index,
        id: gamepad.id || `Kontroler ${gamepad.index + 1}`,
      }))

      setConnectedGamepads((current) =>
        areConnectedGamepadOptionsEqual(current, nextConnectedGamepads) ? current : nextConnectedGamepads,
      )

      const preferredGamepad = pickPreferredGamepad(availableGamepads)
      const selectedGamepad =
        (selectedGamepadIndex !== null
          ? availableGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex) ?? null
          : null) ?? preferredGamepad

      if (!selectedGamepad) {
        setGamepadDebug((current) => {
          const nextState = {
            connected: false,
            id: '',
            index: null,
            buttons: 0,
            axes: 0,
            currentInput: null,
          }

          return areGamepadDebugStatesEqual(current, nextState) ? current : nextState
        })
        frameId = window.requestAnimationFrame(tick)
        return
      }

      if (
        selectedGamepadIndex === null ||
        !availableGamepads.some((gamepad) => gamepad.index === selectedGamepadIndex)
      ) {
        setSelectedGamepadIndex(selectedGamepad.index)
      }

      setGamepadDebug((current) => {
        const nextState = {
          connected: true,
          id: selectedGamepad.id || 'Nieznany kontroler',
          index: selectedGamepad.index,
          buttons: selectedGamepad.buttons.length,
          axes: selectedGamepad.axes.length,
          currentInput: formatControllerLabelForProfile(
            getCurrentGamepadInputLabel(selectedGamepad) ?? '',
            detectGamepadProfile(selectedGamepad.id || ''),
          ),
        }

        return areGamepadDebugStatesEqual(current, nextState) ? current : nextState
      })

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isPadView, selectedGamepadIndex])

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragStateRef.current) {
        return
      }

      setDebugPopupPosition({
        x: Math.max(8, event.clientX - dragStateRef.current.offsetX),
        y: Math.max(8, event.clientY - dragStateRef.current.offsetY),
      })
    }

    function handlePointerUp(event: PointerEvent) {
      if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
        return
      }

      dragStateRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  function handleDebugPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const popupRect = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!popupRect) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - popupRect.left,
      offsetY: event.clientY - popupRect.top,
    }
  }

  return {
    gamepadDebug,
    connectedGamepads,
    selectedGamepadIndex,
    setSelectedGamepadIndex,
    isDebugOpen,
    setIsDebugOpen,
    debugPopupPosition,
    handleDebugPointerDown,
  }
}

'use client'

import { useHostNavigationInput, resolveFixedHostNavigationAction } from '@party/ui'
import { useEffect, useRef } from 'react'
import {
  createGamepadSnapshot,
  detectGamepadProfile,
  getGamepadInputLabel,
  isTypingTarget,
  listConnectedGamepads,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  type GamepadSnapshot,
} from './charades-controls-bindings'
import { type HostControlAction, type HostControlDevice } from '../runtime/play/host-controls'

type UseMenuControlsOptions = {
  enabled?: boolean
  onAction: (action: HostControlAction, input?: { device: HostControlDevice; inputLabel: string }) => void
  onDeviceChange?: (device: HostControlDevice) => void
  onControllerProfileChange?: (profile: 'xbox' | 'playstation' | 'generic') => void
}

export function useMenuControls({
  enabled = true,
  onAction,
  onDeviceChange,
  onControllerProfileChange,
}: UseMenuControlsOptions) {
  const onActionRef = useRef(onAction)
  const onDeviceChangeRef = useRef(onDeviceChange)
  const onControllerProfileChangeRef = useRef(onControllerProfileChange)
  const enabledRef = useRef(enabled)
  const lastDeviceRef = useRef<HostControlDevice | null>(null)
  const lastControllerProfileRef = useRef<'xbox' | 'playstation' | 'generic'>('generic')

  onActionRef.current = onAction
  onDeviceChangeRef.current = onDeviceChange
  onControllerProfileChangeRef.current = onControllerProfileChange
  enabledRef.current = enabled

  useEffect(() => {
    onActionRef.current = onAction
  }, [onAction])

  useEffect(() => {
    onDeviceChangeRef.current = onDeviceChange
  }, [onDeviceChange])

  useEffect(() => {
    onControllerProfileChangeRef.current = onControllerProfileChange
  }, [onControllerProfileChange])

  useHostNavigationInput({
    enabled,
    shouldHandleKeyboardEvent: (event) => !isTypingTarget(event.target),
    onAction: (action, input) => {
      const inputLabel = normalizeKeyboardInput(input.inputLabel)
      if (!inputLabel || !isHostControlAction(action)) {
        return
      }

      reportDevice('keyboard', lastDeviceRef, onDeviceChangeRef)
      onActionRef.current(action, { device: 'keyboard', inputLabel })
    },
  })

  useEffect(() => {
    let frameId = 0
    let previousSnapshot: GamepadSnapshot | null = null

    const tick = () => {
      if (!enabledRef.current) {
        const sleepingGamepad = pickPreferredGamepad(listConnectedGamepads())
        previousSnapshot = sleepingGamepad ? createGamepadSnapshot(sleepingGamepad) : null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const activeGamepad = pickPreferredGamepad(listConnectedGamepads())

      if (!activeGamepad) {
        previousSnapshot = null
        if (lastControllerProfileRef.current !== 'generic') {
          lastControllerProfileRef.current = 'generic'
          onControllerProfileChangeRef.current?.('generic')
        }
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const profile = detectGamepadProfile(activeGamepad.id || '')
      if (lastControllerProfileRef.current !== profile) {
        lastControllerProfileRef.current = profile
        onControllerProfileChangeRef.current?.(profile)
      }

      const nextSnapshot = createGamepadSnapshot(activeGamepad)
      if (!previousSnapshot) {
        previousSnapshot = nextSnapshot
        reportDevice('controller', lastDeviceRef, onDeviceChangeRef)
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const inputLabel = getGamepadInputLabel(activeGamepad, previousSnapshot)
      previousSnapshot = nextSnapshot

      if (!inputLabel) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const action = resolveFixedHostNavigationAction('controller', inputLabel)
      if (action && isHostControlAction(action)) {
        reportDevice('controller', lastDeviceRef, onDeviceChangeRef)
        onActionRef.current(action, { device: 'controller', inputLabel })
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [])
}

function reportDevice(
  nextDevice: HostControlDevice,
  lastDeviceRef: { current: HostControlDevice | null },
  onDeviceChangeRef: { current?: ((device: HostControlDevice) => void) | undefined },
) {
  if (lastDeviceRef.current === nextDevice) {
    return
  }

  lastDeviceRef.current = nextDevice
  onDeviceChangeRef.current?.(nextDevice)
}

function isHostControlAction(action: string): action is HostControlAction {
  return (
    action === 'left' ||
    action === 'right' ||
    action === 'up' ||
    action === 'down' ||
    action === 'confirm' ||
    action === 'back' ||
    action === 'menu' ||
    action === 'primary' ||
    action === 'secondary'
  )
}

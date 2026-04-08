'use client'

import { useEffect, useRef } from 'react'
import {
  CHARADES_BINDINGS_STORAGE_KEY,
  CHARADES_BINDINGS_UPDATED_EVENT,
  createDefaultBindings,
  createGamepadSnapshot,
  detectGamepadProfile,
  getGamepadInputLabel,
  listConnectedGamepads,
  loadPersistedBindings,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  type GamepadSnapshot,
} from '../../menu/charades-controls-bindings'
import {
  resolveHostControlCommand,
  type HostControlCommand,
  type HostControlsContext,
} from './host-controls'
import { resolveRuntimeHostAction, shouldReportControllerDevice } from './runtime-input-helpers'

type UseHostControlsOptions = {
  context: HostControlsContext
  onCommand: (command: HostControlCommand) => void
  onDeviceChange?: (device: 'keyboard' | 'controller') => void
  onControllerProfileChange?: (profile: 'xbox' | 'playstation' | 'generic') => void
}

export function useHostControls({ context, onCommand, onDeviceChange, onControllerProfileChange }: UseHostControlsOptions) {
  const bindingsRef = useRef<Record<string, string>>(createDefaultBindings())
  const contextRef = useRef(context)
  const onCommandRef = useRef(onCommand)
  const onDeviceChangeRef = useRef(onDeviceChange)
  const onControllerProfileChangeRef = useRef(onControllerProfileChange)
  const lastDeviceRef = useRef<'keyboard' | 'controller'>('keyboard')
  const lastControllerProfileRef = useRef<'xbox' | 'playstation' | 'generic'>('generic')

  useEffect(() => {
    contextRef.current = context
  }, [context])

  useEffect(() => {
    onCommandRef.current = onCommand
  }, [onCommand])

  useEffect(() => {
    onDeviceChangeRef.current = onDeviceChange
  }, [onDeviceChange])

  useEffect(() => {
    onControllerProfileChangeRef.current = onControllerProfileChange
  }, [onControllerProfileChange])

  useEffect(() => {
    bindingsRef.current = loadPersistedBindings()

    function handleStorage(event: StorageEvent) {
      if (event.key === CHARADES_BINDINGS_STORAGE_KEY) {
        bindingsRef.current = loadPersistedBindings()
      }
    }

    function handleBindingsUpdated() {
      bindingsRef.current = loadPersistedBindings()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CHARADES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CHARADES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || isTypingTarget(event.target)) {
        return
      }

      const inputLabel = normalizeKeyboardInput(event.key)
      if (!inputLabel) {
        return
      }

      const action = resolveRuntimeHostAction(contextRef.current, bindingsRef.current, 'keyboard', inputLabel)
      if (!action) {
        return
      }

      const command = resolveHostControlCommand(contextRef.current, action)
      if (!command) {
        return
      }

      event.preventDefault()
      reportDevice('keyboard', lastDeviceRef, onDeviceChangeRef)
      onCommandRef.current(command)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    let frameId = 0
    let previousSnapshot: GamepadSnapshot | null = null

    const tick = () => {
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
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const inputLabel = getGamepadInputLabel(activeGamepad, previousSnapshot)
      previousSnapshot = nextSnapshot

      if (!inputLabel) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const action = resolveRuntimeHostAction(contextRef.current, bindingsRef.current, 'controller', inputLabel)
      if (!action) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const command = resolveHostControlCommand(contextRef.current, action)
      if (command) {
        if (shouldReportControllerDevice(previousSnapshot, inputLabel)) {
          reportDevice('controller', lastDeviceRef, onDeviceChangeRef)
        }
        onCommandRef.current(command)
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [])
}

function reportDevice(
  nextDevice: 'keyboard' | 'controller',
  lastDeviceRef: { current: 'keyboard' | 'controller' },
  onDeviceChangeRef: { current?: ((device: 'keyboard' | 'controller') => void) | undefined },
) {
  if (lastDeviceRef.current === nextDevice) {
    return
  }

  lastDeviceRef.current = nextDevice
  onDeviceChangeRef.current?.(nextDevice)
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyHostNavigationTransition,
  closeHostNavigationModal,
  createHostNavigationState,
  openHostNavigationModal,
  type HostNavigationFocusSnapshot,
} from '@party/ui'
import {
  CODENAMES_BINDINGS_STORAGE_KEY,
  CODENAMES_BINDINGS_UPDATED_EVENT,
  createDefaultBindings,
  createGamepadSnapshot,
  detectGamepadProfile,
  getGamepadInputLabel,
  isTypingTarget,
  listConnectedGamepads,
  loadPersistedBindings,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  type GamepadSnapshot,
} from '../../menu/codenames-controls-bindings'
import { codenamesRuntimeNavigationProfile } from '../../navigation/codenames-runtime-navigation-profile'
import {
  CODENAMES_NAVIGATION_SCREENS,
  getCodenamesRuntimeEntryTarget,
} from '../../navigation/codenames-navigation-targets'
import {
  createRuntimeInputState,
  shouldBlockRuntimeAction,
  sleepRuntimeInput,
  updateRuntimeControllerWakeGuard,
  wakeRuntimeInput,
  type RuntimeInputState,
} from './runtime-input-state'
import {
  resolveRuntimeCommand,
  type HostControlCommand,
  type RuntimeCommandContext,
} from './host-controls'
import { resolveRuntimeHostAction, shouldReportControllerDevice } from './runtime-input-helpers'

type UseHostControlsOptions = {
  enabled?: boolean
  commandContext: RuntimeCommandContext & {
    boardCardCount: number
    isStatusRailOpen: boolean
  }
  onCommand: (command: HostControlCommand) => void
  onDeviceChange?: (device: 'keyboard' | 'controller') => void
  onControllerProfileChange?: (profile: 'xbox' | 'playstation' | 'generic') => void
}

export function useHostControls({
  enabled = true,
  commandContext,
  onCommand,
  onDeviceChange,
  onControllerProfileChange,
}: UseHostControlsOptions) {
  const [inputState, setInputState] = useState<RuntimeInputState>(() => createRuntimeInputState())
  const [focusState, setFocusState] = useState(() => {
    const entryTarget = getCodenamesRuntimeEntryTarget()
    return createHostNavigationState({
      screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
      zoneId: entryTarget.zoneId,
      targetId: entryTarget.targetId,
      isAwake: true,
    })
  })

  const bindingsRef = useRef<Record<string, string>>(createDefaultBindings())
  const inputStateRef = useRef(inputState)
  const focusStateRef = useRef(focusState)
  const commandContextRef = useRef(commandContext)
  const onCommandRef = useRef(onCommand)
  const onDeviceChangeRef = useRef(onDeviceChange)
  const onControllerProfileChangeRef = useRef(onControllerProfileChange)
  const lastDeviceRef = useRef<'keyboard' | 'controller'>('keyboard')
  const lastControllerProfileRef = useRef<'xbox' | 'playstation' | 'generic'>('generic')

  useEffect(() => {
    inputStateRef.current = inputState
  }, [inputState])

  useEffect(() => {
    focusStateRef.current = focusState
  }, [focusState])

  useEffect(() => {
    commandContextRef.current = commandContext
  }, [commandContext])

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
      if (event.key === CODENAMES_BINDINGS_STORAGE_KEY) {
        bindingsRef.current = loadPersistedBindings()
      }
    }

    function handleBindingsUpdated() {
      bindingsRef.current = loadPersistedBindings()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CODENAMES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CODENAMES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || isTypingTarget(event.target)) {
        return
      }

      const inputLabel = normalizeKeyboardInput(event.key)
      if (!inputLabel) {
        return
      }

      const action = resolveRuntimeHostAction(bindingsRef.current, 'keyboard', inputLabel)
      if (!action) {
        return
      }

      event.preventDefault()
      reportDevice('keyboard', lastDeviceRef, onDeviceChangeRef)

      if (shouldBlockRuntimeAction(inputStateRef.current, 'keyboard')) {
        setInputState((current) => wakeRuntimeInput(current, 'keyboard'))
        return
      }

      if (action === 'rail') {
        const command = resolveRuntimeCommand('codenames.runtime.toggle-status-rail', commandContextRef.current)
        if (command) {
          onCommandRef.current(command)
        }
        return
      }

      const transition = codenamesRuntimeNavigationProfile.resolveAction({
        context: {
          boardCardCount: commandContextRef.current.boardCardCount,
          isStatusRailOpen: commandContextRef.current.isStatusRailOpen,
        },
        current: {
          zoneId: focusStateRef.current.zoneId,
          targetId: focusStateRef.current.targetId,
        },
        action,
      })

      if (transition.type === 'delegate') {
        const command = resolveRuntimeCommand(transition.commandId, commandContextRef.current)
        if (command) {
          onCommandRef.current(command)
        }
        return
      }

      if (transition.type === 'close-modal') {
        setFocusState((current) => closeHostNavigationModal(current))
        return
      }

      if (transition.type === 'open-modal') {
        setFocusState((current) =>
          openHostNavigationModal(current, {
            screenId: transition.screenId,
            zoneId: transition.zoneId,
            targetId: transition.targetId,
          }),
        )
        return
      }

      setFocusState((current) => applyHostNavigationTransition(current, transition))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      return
    }

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
        setInputState((current) => updateRuntimeControllerWakeGuard(current, true))
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const action = resolveRuntimeHostAction(bindingsRef.current, 'controller', inputLabel)
      if (!action) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      if (shouldReportControllerDevice(previousSnapshot, inputLabel)) {
        reportDevice('controller', lastDeviceRef, onDeviceChangeRef)
      }

      if (shouldBlockRuntimeAction(inputStateRef.current, 'controller')) {
        setInputState((current) => wakeRuntimeInput(current, 'controller'))
        frameId = window.requestAnimationFrame(tick)
        return
      }

      if (action === 'rail') {
        const command = resolveRuntimeCommand('codenames.runtime.toggle-status-rail', commandContextRef.current)
        if (command) {
          onCommandRef.current(command)
        }
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const transition = codenamesRuntimeNavigationProfile.resolveAction({
        context: {
          boardCardCount: commandContextRef.current.boardCardCount,
          isStatusRailOpen: commandContextRef.current.isStatusRailOpen,
        },
        current: {
          zoneId: focusStateRef.current.zoneId,
          targetId: focusStateRef.current.targetId,
        },
        action,
      })

      if (transition.type === 'delegate') {
        const command = resolveRuntimeCommand(transition.commandId, commandContextRef.current)
        if (command) {
          onCommandRef.current(command)
        }
      } else if (transition.type === 'close-modal') {
        setFocusState((current) => closeHostNavigationModal(current))
      } else if (transition.type === 'open-modal') {
        setFocusState((current) =>
          openHostNavigationModal(current, {
            screenId: transition.screenId,
            zoneId: transition.zoneId,
            targetId: transition.targetId,
          }),
        )
      } else {
        setFocusState((current) => applyHostNavigationTransition(current, transition))
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [enabled])

  const closeModal = useCallback(() => {
    setFocusState((current) => closeHostNavigationModal(current))
  }, [])

  const openModal = useCallback((target: HostNavigationFocusSnapshot) => {
    setFocusState((current) => openHostNavigationModal(current, target))
  }, [])

  const setFocus = useCallback((target: HostNavigationFocusSnapshot) => {
    setFocusState((current) => ({
      ...current,
      screenId: target.screenId,
      zoneId: target.zoneId,
      targetId: target.targetId,
    }))
  }, [])

  const sleep = useCallback(() => {
    setInputState((current) => sleepRuntimeInput(current, 'mouse'))
  }, [])

  return {
    focusState,
    inputState,
    closeModal,
    openModal,
    setFocus,
    sleep,
  }
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

'use client'

import { useEffect, useState } from 'react'
import type { GameResultsProps } from '@party/game-sdk'
import styles from './CharadesResults.module.css'
import { Podium } from './Podium'
import type { CharadesResultPlayer } from './types'
import {
  CHARADES_BINDINGS_STORAGE_KEY,
  CHARADES_BINDINGS_UPDATED_EVENT,
  createGamepadSnapshot,
  detectGamepadProfile,
  formatControllerLabelForProfile,
  getGamepadInputLabel,
  isTypingTarget,
  listConnectedGamepads,
  loadPersistedBindings,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  type GamepadProfile,
  type GamepadSnapshot,
} from '../menu/charades-controls-bindings'
import { ActionHint } from '../runtime/play/ActionHint'
import { getHostControlActionLabel } from '../runtime/play/host-controls'
import {
  createRuntimeInputState,
  sleepRuntimeInput,
  shouldBlockRuntimeAction,
  updateRuntimeControllerWakeGuard,
  wakeRuntimeInput,
} from '../runtime/play/runtime-input-state'
import { ExitToMenuAlert } from '../shared/ExitToMenuAlert'
import {
  getNextResultsActionTarget,
  resolveResultsAction,
  type ResultsActionTarget,
} from './results-controls'

type Props = GameResultsProps & {
  players: CharadesResultPlayer[]
}

export function CharadesResults({ players, onPlayAgain, onBackToMenu }: Props) {
  const [selectedAction, setSelectedAction] = useState<ResultsActionTarget>('again')
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
  const [exitConfirmFocusTarget, setExitConfirmFocusTarget] = useState<'stay' | 'exit'>('stay')
  const [inputState, setInputState] = useState(() => createRuntimeInputState())
  const [controlBindings, setControlBindings] = useState<Record<string, string>>({})
  const [activeInputDevice, setActiveInputDevice] = useState<'keyboard' | 'controller'>('keyboard')
  const [controllerProfile, setControllerProfile] = useState<GamepadProfile>('generic')

  const openExitConfirm = () => {
    setExitConfirmFocusTarget('stay')
    setIsExitConfirmOpen(true)
  }

  const closeExitConfirm = () => {
    setExitConfirmFocusTarget('stay')
    setIsExitConfirmOpen(false)
  }

  useEffect(() => {
    setControlBindings(loadPersistedBindings())

    function handleStorage(event: StorageEvent) {
      if (event.key === CHARADES_BINDINGS_STORAGE_KEY) {
        setControlBindings(loadPersistedBindings())
      }
    }

    function handleBindingsUpdated() {
      setControlBindings(loadPersistedBindings())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CHARADES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CHARADES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    }
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse') {
        return
      }

      setInputState((current) => sleepRuntimeInput(current, 'mouse'))
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
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

      const action = resolveResultsAction(controlBindings, 'keyboard', inputLabel)
      if (!action) {
        return
      }

      event.preventDefault()
      setActiveInputDevice('keyboard')

      if (shouldBlockRuntimeAction(inputState, 'keyboard')) {
        setInputState(wakeRuntimeInput(inputState, 'keyboard'))
        return
      }

      if (isExitConfirmOpen) {
        if (action === 'left' || action === 'up') {
          setExitConfirmFocusTarget('exit')
          return
        }

        if (action === 'right' || action === 'down') {
          setExitConfirmFocusTarget('stay')
          return
        }

        if (action === 'confirm') {
          if (exitConfirmFocusTarget === 'exit') {
            onBackToMenu()
            return
          }

          closeExitConfirm()
          return
        }

        if (action === 'back' || action === 'menu') {
          closeExitConfirm()
        }

        return
      }

      if (action === 'confirm') {
        if (selectedAction === 'again') {
          onPlayAgain()
          return
        }

        openExitConfirm()
        return
      }

      if (action === 'back' || action === 'menu') {
        openExitConfirm()
        return
      }

      setSelectedAction((current) => getNextResultsActionTarget(current, action))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeExitConfirm, controlBindings, exitConfirmFocusTarget, inputState, isExitConfirmOpen, onBackToMenu, onPlayAgain, selectedAction])

  useEffect(() => {
    let frameId = 0
    let previousSnapshot: GamepadSnapshot | null = null

    const tick = () => {
      const activeGamepad = pickPreferredGamepad(listConnectedGamepads())

      if (!activeGamepad) {
        previousSnapshot = null
        if (controllerProfile !== 'generic') {
          setControllerProfile('generic')
        }
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const profile = detectGamepadProfile(activeGamepad.id || '')
      if (controllerProfile !== profile) {
        setControllerProfile(profile)
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

      const action = resolveResultsAction(controlBindings, 'controller', inputLabel)
      if (!action) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      setActiveInputDevice('controller')

      if (shouldBlockRuntimeAction(inputState, 'controller')) {
        setInputState(wakeRuntimeInput(inputState, 'controller'))
        frameId = window.requestAnimationFrame(tick)
        return
      }

      if (isExitConfirmOpen) {
        if (action === 'left' || action === 'up') {
          setExitConfirmFocusTarget('exit')
          frameId = window.requestAnimationFrame(tick)
          return
        }

        if (action === 'right' || action === 'down') {
          setExitConfirmFocusTarget('stay')
          frameId = window.requestAnimationFrame(tick)
          return
        }

        if (action === 'confirm') {
          if (exitConfirmFocusTarget === 'exit') {
            onBackToMenu()
          } else {
            closeExitConfirm()
          }
          frameId = window.requestAnimationFrame(tick)
          return
        }

        if (action === 'back' || action === 'menu') {
          closeExitConfirm()
          frameId = window.requestAnimationFrame(tick)
          return
        }
      }

      if (action === 'confirm') {
        if (selectedAction === 'again') {
          onPlayAgain()
        } else {
          openExitConfirm()
        }
        frameId = window.requestAnimationFrame(tick)
        return
      }

      if (action === 'back' || action === 'menu') {
        openExitConfirm()
        frameId = window.requestAnimationFrame(tick)
        return
      }

      setSelectedAction((current) => getNextResultsActionTarget(current, action))
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [closeExitConfirm, controlBindings, controllerProfile, exitConfirmFocusTarget, inputState, isExitConfirmOpen, onBackToMenu, onPlayAgain, selectedAction])

  const isFocusVisible = inputState.isAwake
  const confirmHintLabel = (() => {
    const label = getHostControlActionLabel(controlBindings, activeInputDevice, 'confirm')
    if (!label) {
      return null
    }

    return activeInputDevice === 'controller'
      ? formatControllerLabelForProfile(label, controllerProfile)
      : label
  })()

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Finał gry</p>
        <h1 className={styles.title}>Wyniki kalamburów</h1>
      </div>

      <section className={styles.resultsPanel}>
        <Podium players={players} />
      </section>

      <div className={styles.actions}>
        <button
          type="button"
          className={[
            styles.againBtn,
            isFocusVisible && selectedAction === 'again' ? styles.controlFocused : '',
          ].filter(Boolean).join(' ')}
          onClick={onPlayAgain}
        >
          <span>Zagraj jeszcze raz</span>
          <ActionHint label={isFocusVisible && selectedAction === 'again' ? confirmHintLabel : null} />
        </button>
        <button
          type="button"
          className={[
            styles.menuBtn,
            isFocusVisible && selectedAction === 'menu' ? styles.controlFocused : '',
          ].filter(Boolean).join(' ')}
          onClick={openExitConfirm}
        >
          <span>Wróć do menu</span>
          <ActionHint label={isFocusVisible && selectedAction === 'menu' ? confirmHintLabel : null} muted />
        </button>
      </div>

      {isExitConfirmOpen ? (
        <ExitToMenuAlert
          copy="Opuścisz ekran wyników i wrócisz do menu gry."
          focusedTarget={exitConfirmFocusTarget}
          isFocusVisible={isFocusVisible}
          onStay={closeExitConfirm}
          onExit={onBackToMenu}
          actionHints={{
            confirm: confirmHintLabel,
          }}
        />
      ) : null}
    </main>
  )
}

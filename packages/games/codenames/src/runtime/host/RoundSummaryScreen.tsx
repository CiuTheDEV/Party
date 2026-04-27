'use client'

import { useEffect, useMemo, useState } from 'react'
import { AvatarAsset } from '@party/ui'
import {
  CODENAMES_BINDINGS_STORAGE_KEY,
  CODENAMES_BINDINGS_UPDATED_EVENT,
  formatControllerLabelForProfile,
  getBindingValue,
  loadPersistedBindings,
  type GamepadProfile,
} from '../../menu/codenames-controls-bindings'
import { useMenuControls } from '../../menu/useMenuControls'
import styles from './RoundSummaryScreen.module.css'

type CodenamesTeam = { name: string; avatar: string }
type SummaryReason = 'assassin' | 'victory'

type RoundSummaryScreenProps = {
  reason: SummaryReason
  redTeam: CodenamesTeam
  blueTeam: CodenamesTeam
  winnerTeam: CodenamesTeam
  loserTeam: CodenamesTeam
  redRoundWins: number
  blueRoundWins: number
  roundsToWin: number
  onNextRound: () => void
  onShowBoardKey: () => void
  controlsEnabled?: boolean
}

export function RoundSummaryScreen({
  reason,
  redTeam,
  blueTeam,
  winnerTeam,
  loserTeam,
  redRoundWins,
  blueRoundWins,
  roundsToWin,
  onNextRound,
  onShowBoardKey,
  controlsEnabled = true,
}: RoundSummaryScreenProps) {
  const [isInputAwake, setIsInputAwake] = useState(true)
  const [activeInputDevice, setActiveInputDevice] = useState<'keyboard' | 'controller'>('keyboard')
  const [controllerProfile, setControllerProfile] = useState<GamepadProfile>('generic')
  const [controlBindings, setControlBindings] = useState(() => loadPersistedBindings())

  const [focusedAction, setFocusedAction] = useState<'show-key' | 'next'>('next')

  useMenuControls({
    enabled: controlsEnabled,
    onAction: (action, input) => {
      if (!isInputAwake) {
        setActiveInputDevice(input?.device ?? 'keyboard')
        setIsInputAwake(true)
        return
      }

      if (action === 'left' || action === 'right') {
        setFocusedAction((current) => (current === 'next' ? 'show-key' : 'next'))
        return
      }

      if (action === 'confirm' || action === 'primary') {
        if (focusedAction === 'show-key') {
          onShowBoardKey()
          return
        }

        onNextRound()
      }
    },
    onDeviceChange: setActiveInputDevice,
    onControllerProfileChange: setControllerProfile,
  })

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CODENAMES_BINDINGS_STORAGE_KEY) {
        setControlBindings(loadPersistedBindings())
      }
    }

    function handleBindingsUpdated() {
      setControlBindings(loadPersistedBindings())
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === 'mouse') {
        setIsInputAwake(false)
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CODENAMES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    window.addEventListener('pointermove', handlePointerMove)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CODENAMES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  const confirmActionLabel = useMemo(() => {
    const bindingId = activeInputDevice === 'controller' ? 'controller-confirm' : 'keyboard-confirm'
    const labels = [getBindingValue(controlBindings, bindingId, 'primary'), getBindingValue(controlBindings, bindingId, 'secondary')].filter(Boolean)

    if (labels.length === 0) {
      return null
    }

    return labels
      .map((label) =>
        activeInputDevice === 'controller' ? formatControllerLabelForProfile(label, controllerProfile) : formatKeyboardBadgeLabel(label),
      )
      .join(' / ')
  }, [activeInputDevice, controlBindings, controllerProfile])

  const bannerText =
    reason === 'assassin'
      ? `${loserTeam.name} trafili na zabójcę!`
      : `${winnerTeam.name} wygrali rundę!`

  const bannerAvatar = reason === 'assassin' ? loserTeam.avatar : winnerTeam.avatar

  return (
    <div className={styles.overlay}>
      <div className={styles.shell}>
        <div className={styles.banner}>
          <AvatarAsset avatar={bannerAvatar} size={40} />
          <span className={styles.bannerText}>{bannerText}</span>
        </div>

        <div className={styles.vsRow}>
          <div className={styles.teamSide}>
            <div className={styles.teamSideIcon} data-team="red">
              <AvatarAsset avatar={redTeam.avatar} size={48} />
            </div>
            <span className={styles.teamSideLabel}>{redTeam.name}</span>
          </div>

          <div className={styles.scoreCard} data-team="red">{redRoundWins}</div>
          <div className={styles.vs}>VS</div>
          <div className={styles.scoreCard} data-team="blue">{blueRoundWins}</div>

          <div className={styles.teamSide} data-side="right">
            <span className={styles.teamSideLabel}>{blueTeam.name}</span>
            <div className={styles.teamSideIcon} data-team="blue">
              <AvatarAsset avatar={blueTeam.avatar} size={48} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.hint}>Do {roundsToWin} wygranych rund</div>
          <div className={styles.footerActions}>
            <button
              type="button"
              className={
                isInputAwake && focusedAction === 'show-key'
                  ? `${styles.secondaryButton} ${styles.actionButtonFocused}`
                  : styles.secondaryButton
              }
              onClick={onShowBoardKey}
            >
              Pokaż klucz
              {isInputAwake && focusedAction === 'show-key' && confirmActionLabel ? (
                <span className={styles.actionBadge} aria-hidden="true">
                  <span className={styles.actionBadgeLabel}>{confirmActionLabel}</span>
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className={
                isInputAwake && focusedAction === 'next'
                  ? `${styles.nextRoundButton} ${styles.nextRoundButtonFocused}`
                  : styles.nextRoundButton
              }
              onClick={onNextRound}
            >
              Kolejna runda
              {isInputAwake && focusedAction === 'next' && confirmActionLabel ? (
                <span className={styles.actionBadge} aria-hidden="true">
                  <span className={styles.actionBadgeLabel}>{confirmActionLabel}</span>
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatKeyboardBadgeLabel(label: string) {
  switch (label) {
    case 'Enter':
      return '↵'
    case 'Space':
      return '␣'
    case 'Arrow Left':
      return '←'
    case 'Arrow Right':
      return '→'
    case 'Arrow Up':
      return '↑'
    case 'Arrow Down':
      return '↓'
    default:
      return label
  }
}

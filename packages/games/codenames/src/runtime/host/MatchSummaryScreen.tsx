'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AvatarAsset } from '@party/ui'
import { gsap } from 'gsap'
import {
  CODENAMES_BINDINGS_STORAGE_KEY,
  CODENAMES_BINDINGS_UPDATED_EVENT,
  formatControllerLabelForProfile,
  getBindingValue,
  loadPersistedBindings,
  type GamepadProfile,
} from '../../menu/codenames-controls-bindings'
import { useMenuControls } from '../../menu/useMenuControls'
import styles from './MatchSummaryScreen.module.css'

type CodenamesTeam = { name: string; avatar: string }

type MatchSummaryScreenProps = {
  redTeam: CodenamesTeam
  blueTeam: CodenamesTeam
  winnerTeam: CodenamesTeam
  loserTeam: CodenamesTeam
  redRoundWins: number
  blueRoundWins: number
  roundsToWin: number
  onReplayMatch: () => void
  onExitToMenu: () => void
  onShowBoardKey: () => void
  controlsEnabled?: boolean
}

const CONFETTI_PIECES = [
  { left: '6%', top: '8%', size: 16, rotate: -18, tone: 'gold', delay: 0.04 },
  { left: '14%', top: '18%', size: 12, rotate: 14, tone: 'red', delay: 0.1 },
  { left: '20%', top: '5%', size: 18, rotate: -10, tone: 'blue', delay: 0.18 },
  { left: '28%', top: '16%', size: 10, rotate: 22, tone: 'white', delay: 0.12 },
  { left: '72%', top: '8%', size: 18, rotate: -12, tone: 'gold', delay: 0.08 },
  { left: '80%', top: '20%', size: 12, rotate: 16, tone: 'blue', delay: 0.16 },
  { left: '88%', top: '10%', size: 14, rotate: -24, tone: 'red', delay: 0.06 },
  { left: '94%', top: '18%', size: 10, rotate: 12, tone: 'white', delay: 0.2 },
] as const

export function MatchSummaryScreen({
  redTeam,
  blueTeam,
  winnerTeam,
  loserTeam,
  redRoundWins,
  blueRoundWins,
  roundsToWin,
  onReplayMatch,
  onExitToMenu,
  onShowBoardKey,
  controlsEnabled = true,
}: MatchSummaryScreenProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [isInputAwake, setIsInputAwake] = useState(true)
  const [activeInputDevice, setActiveInputDevice] = useState<'keyboard' | 'controller'>('keyboard')
  const [controllerProfile, setControllerProfile] = useState<GamepadProfile>('generic')
  const [controlBindings, setControlBindings] = useState(() => loadPersistedBindings())
  const [focusedAction, setFocusedAction] = useState<'exit' | 'show-key' | 'replay'>('replay')

  useMenuControls({
    enabled: controlsEnabled,
    onAction: (action, input) => {
      if (!isInputAwake) {
        setActiveInputDevice(input?.device ?? 'keyboard')
        setIsInputAwake(true)
        return
      }

      if (action === 'left' || action === 'right') {
        setFocusedAction((current) => {
          const actions: Array<'exit' | 'show-key' | 'replay'> = ['exit', 'show-key', 'replay']
          const currentIndex = actions.indexOf(current)
          if (currentIndex === -1) {
            return 'replay'
          }
          const delta = action === 'left' ? -1 : 1
          return actions[(currentIndex + delta + actions.length) % actions.length] ?? 'replay'
        })
        return
      }

      if (action === 'confirm' || action === 'primary') {
        if (focusedAction === 'exit') {
          onExitToMenu()
          return
        }

        if (focusedAction === 'show-key') {
          onShowBoardKey()
          return
        }

        onReplayMatch()
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

  useLayoutEffect(() => {
    if (!shellRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-match-winner-hero]',
        { autoAlpha: 0, y: 28, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.54, ease: 'power3.out' },
      )

      gsap.fromTo(
        '[data-match-winner-avatar]',
        { y: 20, scale: 0.82, rotate: -10 },
        { y: 0, scale: 1, rotate: 0, duration: 0.7, delay: 0.08, ease: 'back.out(1.5)' },
      )

      gsap.fromTo(
        '[data-match-winner-glow]',
        { scale: 0.78, autoAlpha: 0.18 },
        { scale: 1, autoAlpha: 1, duration: 0.8, delay: 0.02, ease: 'power2.out' },
      )

      gsap.fromTo(
        '[data-confetti-piece]',
        { autoAlpha: 0, y: -22, scale: 0.8 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.04,
          delay: 0.12,
        },
      )
    }, shellRef)

    return () => context.revert()
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

  const winnerIsBlue = winnerTeam === blueTeam
  const bannerText = `${winnerTeam.name} WYGRYWAJĄ MECZ!`
  const bannerAccent = winnerIsBlue ? 'blue' : 'red'
  const winnerRoundWins = winnerIsBlue ? blueRoundWins : redRoundWins
  const loserRoundWins = winnerIsBlue ? redRoundWins : blueRoundWins
  const confettiPieces = useMemo(() => CONFETTI_PIECES, [])

  return (
    <div className={styles.overlay}>
      <div ref={shellRef} className={styles.shell}>
        <div className={styles.celebrationStage}>
          <div className={styles.confettiLayer} aria-hidden="true">
            {confettiPieces.map((piece, index) => (
              <span
                key={`${piece.left}-${piece.top}-${index}`}
                className={styles.confettiPiece}
                data-confetti-piece=""
                data-tone={piece.tone}
                style={
                  {
                    '--confetti-left': piece.left,
                    '--confetti-top': piece.top,
                    '--confetti-size': `${piece.size}px`,
                    '--confetti-rotate': `${piece.rotate}deg`,
                    '--confetti-delay': `${piece.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          <div className={styles.heroCard} data-accent={bannerAccent} data-match-winner-hero="">
            <div className={styles.heroBadge}>Mistrzowie Tajniaków</div>

            <div className={styles.heroAvatarWrap} data-match-winner-avatar="">
              <span className={styles.heroAvatarGlow} data-match-winner-glow="" />
              <span className={styles.heroAvatarRing} />
              <AvatarAsset avatar={winnerTeam.avatar} variant="animated" size={164} className={styles.heroAvatar} />
            </div>

            <div className={styles.heroCopy}>
              <div className={styles.heroTitle}>{bannerText}</div>
              <div className={styles.heroSubtitle}>
                {winnerTeam.name} kończą mecz wynikiem {winnerRoundWins}:{loserRoundWins} przeciwko {loserTeam.name}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.vsRow}>
          <div className={styles.teamSide} data-winner={winnerTeam === redTeam ? 'true' : undefined}>
            <div className={styles.teamSideIcon} data-team="red">
              <AvatarAsset avatar={redTeam.avatar} size={52} />
            </div>
            <span className={styles.teamSideLabel}>{redTeam.name}</span>
          </div>

          <div className={styles.scoreCard} data-team="red" data-winner={winnerTeam === redTeam ? 'true' : undefined}>
            {redRoundWins}
          </div>
          <div className={styles.vs}>VS</div>
          <div className={styles.scoreCard} data-team="blue" data-winner={winnerTeam === blueTeam ? 'true' : undefined}>
            {blueRoundWins}
          </div>

          <div className={styles.teamSide} data-side="right" data-winner={winnerTeam === blueTeam ? 'true' : undefined}>
            <span className={styles.teamSideLabel}>{blueTeam.name}</span>
            <div className={styles.teamSideIcon} data-team="blue">
              <AvatarAsset avatar={blueTeam.avatar} size={52} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.hint}>Do {roundsToWin} wygranych rund</div>
          <div className={styles.footerActions}>
            <button
              type="button"
              className={
                isInputAwake && focusedAction === 'exit'
                  ? `${styles.secondaryButton} ${styles.actionButtonFocused}`
                  : styles.secondaryButton
              }
              onClick={onExitToMenu}
            >
              Powrót do menu
              {isInputAwake && focusedAction === 'exit' && confirmActionLabel ? (
                <span className={styles.actionBadge} aria-hidden="true">
                  <span className={styles.actionBadgeLabel}>{confirmActionLabel}</span>
                </span>
              ) : null}
            </button>
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
                isInputAwake && focusedAction === 'replay'
                  ? `${styles.nextRoundButton} ${styles.actionButtonFocused}`
                  : styles.nextRoundButton
              }
              onClick={onReplayMatch}
            >
              Zagraj ponownie
              {isInputAwake && focusedAction === 'replay' && confirmActionLabel ? (
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

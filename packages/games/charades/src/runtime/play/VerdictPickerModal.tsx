import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AvatarAsset } from '@party/ui'
import { charadesMotionProfile, useCharadesReducedMotion } from '../shared/charades-motion'
import { ActionHint } from './ActionHint'
import styles from './HostGameScreen.module.css'
import type { PlayerSummary } from './playboard-types'
import { getVerdictGridDensity } from './verdict-grid'

type GuessablePlayer = PlayerSummary & {
  index: number
}

type Props = {
  players: GuessablePlayer[]
  selectedPlayerIdx: number | null
  selectionStage: 'players' | 'actions'
  actionTarget: 'cancel' | 'confirm'
  isFocusVisible?: boolean
  onSelectPlayer: (playerIdx: number) => void
  onCancel: () => void
  onConfirm: () => void
  actionHints?: {
    confirm?: string | null
    cancel?: string | null
    previous?: string | null
    next?: string | null
  }
}

export function VerdictPickerModal({
  players,
  selectedPlayerIdx,
  selectionStage,
  actionTarget,
  isFocusVisible = false,
  onSelectPlayer,
  onCancel,
  onConfirm,
  actionHints,
}: Props) {
  const density = getVerdictGridDensity(players.length)
  const reducedMotion = useCharadesReducedMotion()
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const actionsRef = useRef<HTMLDivElement | null>(null)
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null)
  const playerOptionRefs = useRef<Record<number, HTMLButtonElement | null>>({})

  const activatePlayer = (playerIdx: number) => {
    onSelectPlayer(playerIdx)
  }

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      const orderedPlayerNodes = players
        .map((player) => playerOptionRefs.current[player.index])
        .filter(Boolean) as HTMLButtonElement[]
      const timeline = gsap.timeline()

      timeline.fromTo(
        overlayRef.current,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.18,
          ease: 'power1.out',
        },
      )

      timeline.fromTo(
        cardRef.current,
        {
          autoAlpha: 0,
          y: charadesMotionProfile.verdict.y,
          scale: charadesMotionProfile.verdict.scale,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: charadesMotionProfile.verdict.duration,
          ease: charadesMotionProfile.verdict.ease,
        },
        0,
      )

      if (orderedPlayerNodes.length > 0) {
        timeline.fromTo(
          orderedPlayerNodes,
          {
            autoAlpha: 0,
            y: 10,
            scale: 0.985,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.2,
            ease: 'power2.out',
            stagger: charadesMotionProfile.verdict.stagger,
          },
          '<+0.05',
        )
      }

      timeline.fromTo(
        [actionsRef.current].filter(Boolean),
        {
          autoAlpha: 0,
          y: 8,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.2,
          ease: 'power2.out',
          stagger: 0.04,
        },
        '<+0.03',
      )
    }, overlayRef)

    return () => {
      ctx.revert()
    }
  }, [players, reducedMotion])

  useEffect(() => {
    if (reducedMotion || !listRef.current || !actionsRef.current) {
      return
    }

    const playerNodes = players
      .map((player) => playerOptionRefs.current[player.index])
      .filter(Boolean) as HTMLButtonElement[]
    const actionNodes = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean) as HTMLButtonElement[]

    gsap.killTweensOf([...playerNodes, ...actionNodes, listRef.current, actionsRef.current])

    if (selectionStage === 'actions') {
      gsap.to(playerNodes, {
        scale: 0.985,
        autoAlpha: 0.78,
        duration: 0.18,
        ease: 'power2.out',
        stagger: 0.01,
      })
      gsap.fromTo(
        actionsRef.current,
        {
          y: 12,
          autoAlpha: 0.72,
          scale: 0.985,
        },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        },
      )
    } else {
      gsap.to(playerNodes, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.18,
        ease: 'power2.out',
        stagger: 0.008,
        clearProps: 'transform,opacity',
      })
      gsap.fromTo(
        listRef.current,
        {
          y: 8,
          autoAlpha: 0.84,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.18,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        },
      )
    }
  }, [players, reducedMotion, selectionStage])

  useEffect(() => {
    if (reducedMotion || !isFocusVisible) {
      return
    }

    const activeElement =
      selectionStage === 'players'
        ? (selectedPlayerIdx !== null ? playerOptionRefs.current[selectedPlayerIdx] : null)
        : actionTarget === 'confirm'
          ? confirmButtonRef.current
          : cancelButtonRef.current

    if (!activeElement) {
      return
    }

    gsap.killTweensOf(activeElement)
    gsap.fromTo(
      activeElement,
      {
        scale: charadesMotionProfile.verdict.focusScale + 0.02,
        y: -3,
        filter: 'brightness(1.08)',
      },
      {
        scale: 1,
        y: 0,
        filter: 'none',
        duration: 0.18,
        ease: 'back.out(1.6)',
        clearProps: 'transform,filter',
      },
    )
  }, [actionTarget, isFocusVisible, reducedMotion, selectedPlayerIdx, selectionStage])

  useEffect(() => {
    if (selectionStage !== 'actions' || !isFocusVisible) {
      return
    }

    const activeButton = actionTarget === 'confirm' ? confirmButtonRef.current : cancelButtonRef.current
    if (!activeButton) {
      return
    }

    activeButton.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    activeButton.focus({ preventScroll: true })
  }, [actionTarget, isFocusVisible, selectionStage])

  return (
    <div ref={overlayRef} className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Wybierz gracza">
      <div ref={cardRef} className={styles.modalCard} data-stage={selectionStage}>
        <span className={styles.modalEyebrow}>Zgadnięto</span>
        <h2 className={styles.modalTitle}>Który gracz odgadł hasło?</h2>
        <div
          ref={listRef}
          className={styles.modalList}
          data-density={density}
          data-player-count={players.length}
          data-stage={selectionStage}
        >
          {players.map((player) => {
            const isSelected = selectedPlayerIdx === player.index
            const isFocusedPlayer = isSelected && isFocusVisible && selectionStage === 'players'

            return (
              <button
                key={`${player.name}-${player.index}`}
                ref={(node) => {
                  playerOptionRefs.current[player.index] = node
                }}
                type="button"
                className={[
                  styles.playerOption,
                  isSelected ? styles.playerOptionSelected : '',
                  isFocusedPlayer ? styles.controlFocused : '',
                ].filter(Boolean).join(' ')}
                data-stage={selectionStage}
                onClick={() => {
                  activatePlayer(player.index)
                }}
              >
                <AvatarAsset avatar={player.avatar} className={styles.playerAvatar} />
                <span className={styles.playerName} data-gender={player.gender}>
                  {player.name}
                </span>
              </button>
            )
          })}
        </div>
        <div ref={actionsRef} className={styles.modalActions} data-stage={selectionStage}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={[
              styles.cancelButton,
              isFocusVisible && selectionStage === 'actions' && actionTarget === 'cancel' ? styles.controlFocused : '',
            ].filter(Boolean).join(' ')}
            onClick={onCancel}
          >
            <span>Wróć</span>
            <ActionHint
              label={isFocusVisible && selectionStage === 'actions' && actionTarget === 'cancel' ? actionHints?.cancel : null}
              muted
            />
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={[
              styles.confirmButton,
              isFocusVisible && selectionStage === 'actions' && actionTarget === 'confirm' ? styles.controlFocused : '',
            ].filter(Boolean).join(' ')}
            disabled={selectedPlayerIdx === null}
            onClick={onConfirm}
          >
            <span>Przyznaj punkt</span>
            <ActionHint
              label={isFocusVisible && selectionStage === 'actions' && actionTarget === 'confirm' ? actionHints?.confirm : null}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

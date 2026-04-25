import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useCharadesReducedMotion } from '../../shared/charades-motion'
import { AutoscaledWord } from '../../shared/AutoscaledWord'
import { formatGuessTime } from '../../../shared/guess-time'
import { ActionHint } from '../ActionHint'
import styles from '../PlayBoard.module.css'
import { PresenterCard } from '../PlayBoardCards'
import {
  animatePhaseEnter,
  shouldAutoscaleWord,
  shouldWrapVerdictWord,
  type VerdictViewProps,
} from './shared'

export function VerdictView({
  presenter,
  currentWord,
  isTimedOutVerdict = false,
  elapsedGuessSeconds = 0,
  isVerdictWordVisible,
  onToggleWordVisibility,
  revealHintLabel,
}: VerdictViewProps) {
  const useExpandedWordShell = shouldAutoscaleWord(currentWord)
  const wrapVerdictWord = shouldWrapVerdictWord(currentWord)
  const reducedMotion = useCharadesReducedMotion()
  const rootRef = useRef<HTMLElement | null>(null)
  const presenterPaneRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const revealButtonRef = useRef<HTMLButtonElement | null>(null)
  const wordSlotRef = useRef<HTMLDivElement | null>(null)
  const noteRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    return animatePhaseEnter({
      rootRef,
      reducedMotion,
      leadingRef: presenterPaneRef,
      heroRef,
      trailingTargets: [revealButtonRef.current, noteRef.current].filter(Boolean) as HTMLElement[],
    })
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion || !wordSlotRef.current) {
      return
    }

    const wordShell = wordSlotRef.current.querySelector<HTMLElement>(`.${styles.verdictWordShell}`)
    const wordText = wordSlotRef.current.querySelector<HTMLElement>(`.${styles.verdictWord}`)
    const activeNodes = [wordSlotRef.current, wordShell, wordText, revealButtonRef.current, noteRef.current].filter(Boolean)

    gsap.killTweensOf(activeNodes)

    if (isVerdictWordVisible) {
      const timeline = gsap.timeline()

      timeline.fromTo(
        wordSlotRef.current,
        {
          y: 16,
          scale: 0.94,
          rotationX: -10,
          transformPerspective: 900,
          filter: 'drop-shadow(0 22px 34px rgba(0, 0, 0, 0.26)) brightness(1.12)',
        },
        {
          y: 0,
          scale: 1.02,
          rotationX: 0,
          filter: 'drop-shadow(0 16px 24px rgba(0, 0, 0, 0.18)) brightness(1)',
          duration: 0.34,
          ease: 'back.out(1.35)',
        },
      )

      if (wordText) {
        timeline.fromTo(
          wordText,
          {
            autoAlpha: 0.42,
            y: 12,
            scale: 0.985,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.22,
            ease: 'power2.out',
            clearProps: 'transform',
          },
          '<+0.05',
        )
      }

      timeline.to(
        wordSlotRef.current,
        {
          scale: 1,
          duration: 0.12,
          ease: 'power2.out',
          clearProps: 'filter,transformPerspective',
        },
        '>-0.02',
      )
    } else {
      gsap.to(wordSlotRef.current, {
        scale: 0.978,
        y: 8,
        duration: 0.14,
        ease: 'power2.in',
        clearProps: 'filter,transformPerspective',
      })
    }

    if (revealButtonRef.current) {
      gsap.fromTo(
        revealButtonRef.current,
        {
          scale: isVerdictWordVisible ? 0.94 : 0.98,
          y: isVerdictWordVisible ? -4 : 0,
        },
        {
          scale: 1,
          y: 0,
          duration: 0.18,
          ease: 'back.out(1.6)',
          clearProps: 'transform',
        },
      )
    }

    if (noteRef.current && isVerdictWordVisible) {
      gsap.fromTo(
        noteRef.current,
        {
          y: 10,
          autoAlpha: 0.86,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.2,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        },
      )
    }
  }, [isVerdictWordVisible, reducedMotion])

  return (
    <main ref={rootRef} className={styles.board}>
      <section className={styles.stage}>
        <div className={`${styles.prepareLayout} ${styles.verdictLayout}`}>
          <div ref={presenterPaneRef} className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.verdictContent}>
            <span className={styles.eyebrow}>Werdykt</span>
            <div ref={heroRef} className={styles.verdictHero}>
              <h1 className={styles.verdictTitle}>
                {isTimedOutVerdict ? 'Czas dobiegł końca' : 'Hasło odgadnięte?'}
              </h1>
              {!isTimedOutVerdict && elapsedGuessSeconds > 0 ? (
                <div className={styles.verdictGuessTimeBadge}>Czas odpowiedzi: {formatGuessTime(elapsedGuessSeconds)}</div>
              ) : null}
              {currentWord ? (
                <>
                  <button
                    ref={revealButtonRef}
                    type="button"
                    className={styles.verdictRevealButton}
                    data-visible={isVerdictWordVisible}
                    onClick={onToggleWordVisibility}
                  >
                    <span>{isVerdictWordVisible ? 'Ukryj hasło' : 'Pokaż hasło'}</span>
                    <ActionHint label={revealHintLabel} muted />
                  </button>
                  <div ref={wordSlotRef} className={styles.verdictWordSlot} data-visible={isVerdictWordVisible}>
                    <AutoscaledWord
                      text={currentWord}
                      className={`${styles.verdictWordShell} ${styles.verdictWordScaleRoot} ${
                        useExpandedWordShell ? styles.verdictWordShellExpanded : styles.verdictWordShellCompact
                      }`}
                      textClassName={`${styles.verdictWord} ${styles.verdictWordAutoscaled}`}
                      isVisible={isVerdictWordVisible}
                      wrapMode={wrapVerdictWord ? 'balance' : 'nowrap'}
                      minFontSize={18}
                      maxFontSize={wrapVerdictWord ? 58 : 82}
                    />
                  </div>
                </>
              ) : null}
            </div>
            <div ref={noteRef} className={styles.verdictNote}>
              <span className={styles.verdictNoteLabel}>Decyzja hosta</span>
              <p className={styles.verdictNoteText}>
                {isTimedOutVerdict
                  ? 'Czas na prezentowanie minął. Tę turę możesz zakończyć już tylko jako nieodgadniętą.'
                  : 'Wybierz w dolnym pasku, czy prezentowane hasło zostało odgadnięte.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

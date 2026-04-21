import { AvatarAsset } from '@party/ui'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react'
import { gsap } from 'gsap'
import type { CharadesGameSettings } from '../../setup/state'
import {
  charadesMotionProfile,
  getTimerMotionTier,
  useCharadesReducedMotion,
} from '../shared/charades-motion'
import { AutoscaledWord } from '../shared/AutoscaledWord'
import { ActionHint } from './ActionHint'
import styles from './PlayBoard.module.css'
import { PresenterCard } from './PlayBoardCards'
import type { PlayerSummary, RankedPlayer } from './playboard-types'
import { formatGuessTime } from '../../shared/guess-time'

type SharedPhaseProps = {
  presenter: PlayerSummary | undefined
}

type TimerRunningViewProps = SharedPhaseProps & {
  timerRemaining: number
  currentWord: string
  currentCategory: string
  settings: CharadesGameSettings
  animationsEnabled?: boolean
}

type VerdictViewProps = SharedPhaseProps & {
  currentWord: string
  isTimedOutVerdict?: boolean
  elapsedGuessSeconds?: number
  isVerdictWordVisible: boolean
  onToggleWordVisibility: () => void
  revealHintLabel?: string | null
}

type RoundSummaryViewProps = {
  currentRound: number
  totalRounds: number
  leaders: string[]
  topScore: number
  rankedPlayers: RankedPlayer[]
}

type PrepareViewProps = SharedPhaseProps & {
  showScoreRail: boolean
  isScoreRailExpanded: boolean
  displayedScoredPlayers: RankedPlayer[]
  scoreItemRefs: MutableRefObject<Record<string, HTMLDivElement | null>>
  onToggleScoreRail: () => void
  getScoreKey: (player: RankedPlayer) => string
  railHintLabel?: string | null
}

type BufferViewProps = SharedPhaseProps & {
  bufferRemaining: number
  animationsEnabled?: boolean
}

function shouldAutoscaleWord(word: string) {
  const normalized = word.trim()
  const wordCount = normalized.split(/\s+/).filter(Boolean).length

  return normalized.length > 22 || wordCount > 2
}

function shouldWrapVerdictWord(word: string) {
  const normalized = word.trim()
  const wordCount = normalized.split(/\s+/).filter(Boolean).length

  return wordCount > 1
}

function animatePhaseEnter(params: {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  leadingRef?: RefObject<HTMLElement | null>
  heroRef: RefObject<HTMLElement | null>
  trailingRef?: RefObject<HTMLElement | null>
  trailingTargets?: HTMLElement[]
}) {
  if (params.reducedMotion) {
    return () => undefined
  }

  const ctx = gsap.context(() => {
    const timeline = gsap.timeline()

    if (params.leadingRef?.current) {
      timeline.fromTo(
        params.leadingRef.current,
        {
          autoAlpha: 0,
          x: -20,
          scale: charadesMotionProfile.enter.scale,
        },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          duration: charadesMotionProfile.enter.duration,
          ease: charadesMotionProfile.enter.ease,
        },
      )
    }

    timeline.fromTo(
      params.heroRef.current,
      {
        autoAlpha: 0,
        y: charadesMotionProfile.enter.y,
        scale: charadesMotionProfile.enter.scale,
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: charadesMotionProfile.enter.duration,
        ease: charadesMotionProfile.enter.ease,
      },
      params.leadingRef?.current ? '<+0.04' : 0,
    )

    if (params.trailingTargets && params.trailingTargets.length > 0) {
      timeline.fromTo(
        params.trailingTargets,
        {
          autoAlpha: 0,
          y: 14,
          scale: 0.985,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.28,
          ease: 'power2.out',
          stagger: charadesMotionProfile.enter.stagger,
        },
        '<+0.08',
      )
    } else if (params.trailingRef?.current) {
      timeline.fromTo(
        params.trailingRef.current,
        {
          autoAlpha: 0,
          y: 12,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
        },
        '<+0.08',
      )
    }
  }, params.rootRef)

  return () => {
    ctx.revert()
  }
}

export function TimerRunningView({
  presenter,
  timerRemaining,
  currentWord,
  currentCategory,
  settings,
  animationsEnabled = true,
}: TimerRunningViewProps) {
  const wordCount = currentWord.trim().split(/\s+/).filter(Boolean).length
  const activeHintsCount = Number(settings.hints.showCategory) + Number(settings.hints.showWordCount)
  const showHints = settings.hints.enabled && activeHintsCount > 0
  const motionTier = getTimerMotionTier(timerRemaining, settings.timerSeconds)
  const reducedMotion = useCharadesReducedMotion()
  const canPulseCountdown = animationsEnabled
  const rootRef = useRef<HTMLElement | null>(null)
  const presenterPaneRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const hintsRef = useRef<HTMLDivElement | null>(null)
  const timerWrapRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    return animatePhaseEnter({
      rootRef,
      reducedMotion,
      leadingRef: presenterPaneRef,
      heroRef,
      trailingTargets: hintsRef.current ? Array.from(hintsRef.current.children) as HTMLElement[] : [],
    })
  }, [reducedMotion])

  useEffect(() => {
    if (!canPulseCountdown || motionTier === 'normal' || !timerRef.current) {
      return
    }

    const timerScale =
      motionTier === 'critical'
        ? charadesMotionProfile.countdown.pulseScale + charadesMotionProfile.countdown.criticalPulseScaleBoost + 0.04
        : motionTier === 'warning'
          ? charadesMotionProfile.countdown.pulseScale + 0.05
          : 1.06
    const timerRecoilScale = motionTier === 'critical' ? 0.9 : motionTier === 'warning' ? 0.94 : 1
    const timerGlow =
      motionTier === 'critical'
        ? `drop-shadow(0 0 46px rgba(248, 113, 113, ${charadesMotionProfile.countdown.criticalGlow})) brightness(1.32)`
        : motionTier === 'warning'
          ? `drop-shadow(0 0 30px rgba(251, 191, 36, ${charadesMotionProfile.countdown.warningGlow})) brightness(1.18)`
          : 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.16)) brightness(1.05)'
    const heroFrameBorderColor =
      motionTier === 'critical' ? 'rgba(248, 113, 113, 0.52)' : 'rgba(251, 191, 36, 0.38)'
    const heroFrameShadow =
      motionTier === 'critical'
        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.34), 0 0 34px rgba(248, 113, 113, 0.2)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(251, 191, 36, 0.24), 0 0 24px rgba(251, 191, 36, 0.14)'
    gsap.killTweensOf([timerRef.current, heroRef.current])
    const pulseTimeline = gsap.timeline()

    if (motionTier === 'critical') {
      pulseTimeline.set(timerRef.current, {
        scale: 1,
        y: 0,
        filter: timerGlow,
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerScale + 0.03,
        y: -12,
        duration: 0.06,
        ease: 'power2.out',
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerRecoilScale,
        y: 4,
        duration: 0.08,
        ease: 'power2.in',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1.1,
        y: -5,
        duration: 0.06,
        ease: 'power2.out',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1,
        y: 0,
        filter: 'none',
        duration: 0.16,
        ease: 'back.out(2.1)',
        clearProps: 'filter,transform',
      })
    } else {
      pulseTimeline.set(timerRef.current, {
        scale: timerScale,
        y: -8,
        filter: timerGlow,
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerRecoilScale,
        y: 3,
        duration: 0.11,
        ease: 'power2.in',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1,
        y: 0,
        filter: 'none',
        duration: Math.max(0.14, charadesMotionProfile.countdown.pulseDuration - 0.04),
        ease: 'back.out(1.95)',
        clearProps: 'filter,transform',
      })
    }

    if (heroRef.current) {
      if (motionTier === 'critical') {
        pulseTimeline.set(
          heroRef.current,
          {
            borderColor: heroFrameBorderColor,
            boxShadow: heroFrameShadow,
          },
          '<'
        )
        pulseTimeline.to(heroRef.current, {
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(248, 113, 113, 0.18), 0 0 18px rgba(248, 113, 113, 0.12)',
          duration: 0.1,
          ease: 'power2.in',
        })
        pulseTimeline.to(heroRef.current, {
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.28), 0 0 26px rgba(248, 113, 113, 0.16)',
          duration: 0.08,
          ease: 'power2.out',
        })
        pulseTimeline.to(heroRef.current, {
          borderColor: 'rgba(248, 113, 113, 0.24)',
          boxShadow: 'none',
          duration: 0.16,
          ease: 'power2.out',
          clearProps: 'boxShadow',
        })
      } else {
        pulseTimeline.set(
          heroRef.current,
          {
            borderColor: heroFrameBorderColor,
            boxShadow: heroFrameShadow,
          },
          '<'
        )
        pulseTimeline.to(heroRef.current, {
          borderColor: 'rgba(251, 191, 36, 0.2)',
          boxShadow: 'none',
          duration: 0.16,
          ease: 'power2.out',
          clearProps: 'boxShadow',
        })
      }
    }
  }, [canPulseCountdown, settings.timerSeconds, timerRemaining])

  return (
    <main ref={rootRef} className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div ref={presenterPaneRef} className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.timerContent}>
            <span className={styles.eyebrow}>Prezentuj!</span>
            <div ref={heroRef} className={styles.timerHero} data-motion-tier={motionTier}>
              <h1 className={styles.timerTitle}>Czas do końca prezentowania</h1>
              <div ref={timerWrapRef} className={styles.timerPulseStage}>
                <div ref={timerRef} className={styles.timer} data-motion-tier={motionTier}>
                  {timerRemaining}
                </div>
              </div>
            </div>
            {showHints ? (
              <div ref={hintsRef} className={styles.timerHints} data-single={activeHintsCount === 1}>
                {settings.hints.showCategory ? (
                  <div className={styles.timerHintItem}>
                    <span className={styles.timerHintLabel}>Kategoria</span>
                    <span className={styles.timerHintValue}>{currentCategory || 'Brak'}</span>
                  </div>
                ) : null}
                {settings.hints.showWordCount ? (
                  <div className={styles.timerHintItem}>
                    <span className={styles.timerHintLabel}>Liczba słów</span>
                    <span className={styles.timerHintValue}>{wordCount > 0 ? wordCount : 'Brak'}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

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
                {isTimedOutVerdict ? 'Czas dobiegł końca' : 'Czy hasło zostało odgadnięte?'}
              </h1>
              {!isTimedOutVerdict && elapsedGuessSeconds > 0 ? (
                <div className={styles.verdictGuessTimeBadge}>{formatGuessTime(elapsedGuessSeconds)} od startu tury</div>
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

export function RoundSummaryView({
  currentRound,
  totalRounds,
  leaders: _leaders,
  topScore: _topScore,
  rankedPlayers,
}: RoundSummaryViewProps) {
  const reducedMotion = useCharadesReducedMotion()
  const podiumPlayers = rankedPlayers.filter((player) => (player.score ?? 0) > 0 && player.rank <= 3)
  const podiumPlayerNames = new Set(podiumPlayers.map((player) => player.name))
  const remainingPlayers = rankedPlayers.filter((player) => !podiumPlayerNames.has(player.name))
  const remainingListRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const list = remainingListRef.current
    if (!list) {
      return
    }

    list.scrollTop = 0
    gsap.killTweensOf(list)

    if (reducedMotion || remainingPlayers.length === 0) {
      return
    }

    const travel = list.scrollHeight - list.clientHeight
    if (travel <= 12) {
      return
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.9, yoyo: true })
    timeline.to(list, {
      scrollTop: travel,
      duration: Math.max(7, travel / 38),
      ease: 'sine.inOut',
      delay: 0.6,
    })

    return () => {
      timeline.kill()
      gsap.killTweensOf(list)
    }
  }, [reducedMotion, remainingPlayers.length])

  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.summaryScreen}>
          <div className={styles.summaryHero}>
            <h1 className={styles.summaryTitle}>
              Podsumowanie rundy {currentRound}/{totalRounds}
            </h1>
          </div>

          {podiumPlayers.length > 0 ? (
            <div className={styles.summaryTopRanking}>
              {podiumPlayers.map((player) => {
                const isTie = podiumPlayers.filter((candidate) => candidate.rank === player.rank).length > 1
                const roundGuessTime =
                  player.lastScoredRound === currentRound ? player.lastCorrectGuessSeconds ?? null : null

                return (
                  <div key={player.name} className={styles.summaryTopPlayer} data-rank={player.rank}>
                    <div className={styles.summaryTopBadge}>
                      <span className={styles.summaryTopBadgeRank}>#{player.rank}</span>
                      <span className={styles.summaryTopBadgeLabel}>{isTie ? 'Remis' : 'Top'}</span>
                    </div>
                    <AvatarAsset avatar={player.avatar} className={styles.summaryTopAvatar} />
                    <span className={styles.summaryTopName} data-gender={player.gender}>
                      {player.name}
                    </span>
                    <div className={styles.summaryScoreStack}>
                      <span className={styles.summaryTopScore}>{player.score ?? 0}</span>
                      {roundGuessTime ? (
                        <span className={styles.summaryTimeBadge}>{formatGuessTime(roundGuessTime)}</span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          {remainingPlayers.length > 0 ? (
            <div className={styles.summaryRestPanel}>
              <div className={styles.summaryRestHeader}>
                <span className={styles.summaryRestLabel}>Pozostali gracze</span>
              </div>
              <div ref={remainingListRef} className={styles.summaryRestRanking}>
                {remainingPlayers.map((player) => (
                  <div key={player.name} className={styles.summaryRow} data-rank={player.rank}>
                    <span className={styles.summaryRank}>#{player.rank}</span>
                    <AvatarAsset avatar={player.avatar} className={styles.summaryAvatar} />
                    <span className={styles.summaryName} data-gender={player.gender}>
                      {player.name}
                    </span>
                    <div className={styles.summaryScoreStack}>
                      <span className={styles.summaryScore}>{player.score ?? 0}</span>
                      {player.lastScoredRound === currentRound && player.lastCorrectGuessSeconds ? (
                        <span className={styles.summaryTimeBadge}>{formatGuessTime(player.lastCorrectGuessSeconds)}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function PrepareView({
  presenter,
  showScoreRail,
  isScoreRailExpanded,
  displayedScoredPlayers,
  scoreItemRefs,
  onToggleScoreRail,
  getScoreKey,
  railHintLabel,
}: PrepareViewProps) {
  const reducedMotion = useCharadesReducedMotion()
  const rootRef = useRef<HTMLElement | null>(null)
  const presenterPaneRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const stepListRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    return animatePhaseEnter({
      rootRef,
      reducedMotion,
      leadingRef: presenterPaneRef,
      heroRef,
      trailingTargets: stepListRef.current ? Array.from(stepListRef.current.children) as HTMLElement[] : [],
    })
  }, [reducedMotion])

  return (
    <main ref={rootRef} className={`${styles.board} ${styles.boardPrepare}`}>
      <section className={`${styles.stage} ${styles.stagePrepare}`}>
        <div className={styles.prepareScene}>
          <div className={styles.prepareLayout}>
            <div ref={presenterPaneRef} className={styles.preparePlayerPane}>
              <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
            </div>

            <div className={styles.prepareContent}>
              <span className={styles.eyebrow}>Za chwilę start</span>
              <div ref={heroRef} className={styles.prepareHero}>
                <h1 className={styles.title}>Hasło czeka na urządzeniu prezentera</h1>
              </div>

              <div ref={stepListRef} className={styles.stepList}>
                <div className={styles.stepItem}>
                  <span className={styles.stepIndex}>1</span>
                  <p>Po kliknięciu "Odkryj hasło" prezenter ma 10 sekund, by zapoznać się z hasłem.</p>
                </div>
                <div className={styles.stepItem}>
                  <span className={styles.stepIndex}>2</span>
                  <p>Po tym czasie uruchomi się główny licznik na prezentowanie hasła.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showScoreRail ? (
        <aside className={styles.scoreRail} data-expanded={isScoreRailExpanded}>
          <button
            type="button"
            className={styles.scoreRailToggle}
            data-expanded={isScoreRailExpanded}
            onClick={onToggleScoreRail}
            aria-label={isScoreRailExpanded ? 'Schowaj wynik' : 'Pokaż wynik'}
          >
            <span className={styles.scoreRailToggleIcon} aria-hidden="true">
              <ChevronLeft size={22} />
            </span>
            {railHintLabel ? <span className={styles.scoreRailToggleHint}>{railHintLabel}</span> : null}
          </button>

          <div className={styles.scoreRailHeader}>
            <span className={styles.scoreRailLabel}>Wynik</span>
          </div>
          <div className={styles.scoreRailList}>
            {displayedScoredPlayers.map((player) => {
              const key = getScoreKey(player)
              return (
                <div
                  key={key}
                  ref={(element) => {
                    scoreItemRefs.current[key] = element
                  }}
                  className={styles.scoreRailItem}
                  data-rank={displayedScoredPlayers[0]?.score === (player.score ?? 0) ? 'leader' : 'chasing'}
                >
                  <AvatarAsset avatar={player.avatar} className={styles.scoreRailAvatar} />
                  <span className={styles.scoreRailName} data-gender={player.gender}>
                    {player.name}
                  </span>
                  <span className={styles.scoreRailPoints}>{player.score ?? 0}</span>
                </div>
              )
            })}
          </div>
        </aside>
      ) : null}
    </main>
  )
}

export function BufferView({ presenter, bufferRemaining, animationsEnabled = true }: BufferViewProps) {
  const motionTier = getTimerMotionTier(bufferRemaining, 10)
  const reducedMotion = useCharadesReducedMotion()
  const canPulseCountdown = animationsEnabled
  const rootRef = useRef<HTMLElement | null>(null)
  const presenterPaneRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const timerWrapRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<HTMLDivElement | null>(null)
  const noteRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    return animatePhaseEnter({
      rootRef,
      reducedMotion,
      leadingRef: presenterPaneRef,
      heroRef,
      trailingRef: noteRef,
    })
  }, [reducedMotion])

  useEffect(() => {
    if (!canPulseCountdown || motionTier === 'normal' || !timerRef.current) {
      return
    }

    const timerScale =
      motionTier === 'critical'
        ? charadesMotionProfile.countdown.pulseScale + charadesMotionProfile.countdown.criticalPulseScaleBoost + 0.04
        : motionTier === 'warning'
          ? charadesMotionProfile.countdown.pulseScale + 0.05
          : 1.06
    const timerRecoilScale = motionTier === 'critical' ? 0.9 : motionTier === 'warning' ? 0.94 : 1
    const timerGlow =
      motionTier === 'critical'
        ? `drop-shadow(0 0 46px rgba(248, 113, 113, ${charadesMotionProfile.countdown.criticalGlow})) brightness(1.3)`
        : motionTier === 'warning'
          ? `drop-shadow(0 0 30px rgba(251, 191, 36, ${charadesMotionProfile.countdown.warningGlow})) brightness(1.16)`
          : 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.15)) brightness(1.05)'
    const heroFrameBorderColor =
      motionTier === 'critical' ? 'rgba(248, 113, 113, 0.5)' : 'rgba(251, 191, 36, 0.36)'
    const heroFrameShadow =
      motionTier === 'critical'
        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.3), 0 0 30px rgba(248, 113, 113, 0.18)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(251, 191, 36, 0.22), 0 0 20px rgba(251, 191, 36, 0.12)'

    gsap.killTweensOf([timerRef.current, heroRef.current])
    const pulseTimeline = gsap.timeline()
    if (motionTier === 'critical') {
      pulseTimeline.set(timerRef.current, {
        scale: 1,
        y: 0,
        filter: timerGlow,
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerScale + 0.02,
        y: -10,
        duration: 0.06,
        ease: 'power2.out',
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerRecoilScale,
        y: 3,
        duration: 0.08,
        ease: 'power2.in',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1.08,
        y: -4,
        duration: 0.06,
        ease: 'power2.out',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1,
        y: 0,
        filter: 'none',
        duration: 0.16,
        ease: 'back.out(2.1)',
        clearProps: 'filter,transform',
      })
    } else {
      pulseTimeline.set(timerRef.current, {
        scale: timerScale,
        y: -8,
        filter: timerGlow,
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerRecoilScale,
        y: 3,
        duration: 0.11,
        ease: 'power2.in',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1,
        y: 0,
        filter: 'none',
        duration: Math.max(0.14, charadesMotionProfile.countdown.pulseDuration - 0.04),
        ease: 'back.out(1.95)',
        clearProps: 'filter,transform',
      })
    }

    if (heroRef.current) {
      if (motionTier === 'critical') {
        pulseTimeline.set(
          heroRef.current,
          {
            borderColor: heroFrameBorderColor,
            boxShadow: heroFrameShadow,
          },
          '<'
        )
        pulseTimeline.to(heroRef.current, {
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(248, 113, 113, 0.16), 0 0 16px rgba(248, 113, 113, 0.1)',
          duration: 0.1,
          ease: 'power2.in',
        })
        pulseTimeline.to(heroRef.current, {
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.24), 0 0 22px rgba(248, 113, 113, 0.14)',
          duration: 0.08,
          ease: 'power2.out',
        })
        pulseTimeline.to(heroRef.current, {
          borderColor: 'rgba(248, 113, 113, 0.24)',
          boxShadow: 'none',
          duration: 0.16,
          ease: 'power2.out',
          clearProps: 'boxShadow',
        })
      } else {
        pulseTimeline.set(
          heroRef.current,
          {
            borderColor: heroFrameBorderColor,
            boxShadow: heroFrameShadow,
          },
          '<'
        )
        pulseTimeline.to(heroRef.current, {
          borderColor: 'rgba(251, 191, 36, 0.2)',
          boxShadow: 'none',
          duration: 0.16,
          ease: 'power2.out',
          clearProps: 'boxShadow',
        })
      }
    }
  }, [bufferRemaining, canPulseCountdown])

  return (
    <main ref={rootRef} className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div ref={presenterPaneRef} className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.bufferContent}>
            <span className={styles.eyebrow}>Zapamiętaj hasło</span>
            <div ref={heroRef} className={styles.bufferHero} data-motion-tier={motionTier}>
              <h1 className={styles.bufferTitle}>Prezenter zapoznaje się z hasłem</h1>
              <div className={styles.bufferTimerWrap}>
                <div ref={timerWrapRef} className={styles.timerPulseStage}>
                  <div ref={timerRef} className={styles.timer} data-motion-tier={motionTier}>
                    {bufferRemaining}
                  </div>
                </div>
                <span className={styles.bufferTimerLabel}>sekund do startu tury</span>
              </div>
            </div>
            <div ref={noteRef} className={styles.bufferSideNote}>
              <span className={styles.bufferSideNoteLabel}>Na planszy</span>
              <p className={styles.bufferHint}>To jest moment tylko dla prezentera. Reszta graczy czeka na start tury.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

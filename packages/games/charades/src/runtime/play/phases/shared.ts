import { gsap } from 'gsap'
import type { MutableRefObject, RefObject } from 'react'
import type { CharadesGameSettings } from '../../../setup/state'
import { charadesMotionProfile } from '../../shared/charades-motion'
import type { PlayerSummary, RankedPlayer } from '../playboard-types'

export type SharedPhaseProps = {
  presenter: PlayerSummary | undefined
}

export type TimerRunningViewProps = SharedPhaseProps & {
  timerRemaining: number
  currentWord: string
  currentCategory: string
  settings: CharadesGameSettings
  animationsEnabled?: boolean
}

export type VerdictViewProps = SharedPhaseProps & {
  currentWord: string
  isTimedOutVerdict?: boolean
  elapsedGuessSeconds?: number
  isVerdictWordVisible: boolean
  onToggleWordVisibility: () => void
  revealHintLabel?: string | null
}

export type RoundSummaryViewProps = {
  currentRound: number
  totalRounds: number
  leaders: string[]
  topScore: number
  rankedPlayers: RankedPlayer[]
}

export type PrepareViewProps = SharedPhaseProps & {
  showScoreRail: boolean
  isScoreRailExpanded: boolean
  displayedScoredPlayers: RankedPlayer[]
  scoreItemRefs: MutableRefObject<Record<string, HTMLDivElement | null>>
  onToggleScoreRail: () => void
  getScoreKey: (player: RankedPlayer) => string
  railHintLabel?: string | null
}

export type BufferViewProps = SharedPhaseProps & {
  bufferRemaining: number
  animationsEnabled?: boolean
}

export function shouldAutoscaleWord(word: string) {
  const normalized = word.trim()
  const wordCount = normalized.split(/\s+/).filter(Boolean).length

  return normalized.length > 22 || wordCount > 2
}

export function shouldWrapVerdictWord(word: string) {
  const normalized = word.trim()
  const wordCount = normalized.split(/\s+/).filter(Boolean).length

  return wordCount > 1
}

export function animatePhaseEnter(params: {
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

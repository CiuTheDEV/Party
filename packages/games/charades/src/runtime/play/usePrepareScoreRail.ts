import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { getScoreKey } from './playboard-helpers'
import type { Phase, RankedPlayer } from './playboard-types'

const SCORE_RAIL_EXPAND_MS = 420
const SCORE_RAIL_POST_EXPAND_WAIT_MS = 500
const SCORE_RAIL_UPDATE_DELAY_MS = SCORE_RAIL_EXPAND_MS + SCORE_RAIL_POST_EXPAND_WAIT_MS
const SCORE_RAIL_REORDER_DELAY_MS = 24
const SCORE_RAIL_POST_REORDER_CLOSE_MS = 5000

type UsePrepareScoreRailParams = {
  phase: Phase
  scoredPlayers: RankedPlayer[]
}

export function usePrepareScoreRail({ phase, scoredPlayers }: UsePrepareScoreRailParams) {
  const [isScoreRailExpanded, setIsScoreRailExpanded] = useState(false)
  const [displayedScoredPlayers, setDisplayedScoredPlayers] = useState<RankedPlayer[]>([])
  const scoreItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevScorePositionsRef = useRef<Record<string, DOMRect>>({})
  const scoreRailCollapseTimerRef = useRef<number | null>(null)
  const scoreRailCommitTimerRef = useRef<number | null>(null)
  const scoreRailReorderTimerRef = useRef<number | null>(null)
  const prevScoreSignatureRef = useRef('')
  const prevPhaseRef = useRef<Phase>(phase)
  const pendingScorePlayersRef = useRef<RankedPlayer[]>([])
  const animateScoreRailOnNextDisplayRef = useRef(false)

  const hasAnyScore = scoredPlayers.length > 0
  const showPrepareScoreRail = phase === 'prepare' && displayedScoredPlayers.length > 0
  const scoreSignature = scoredPlayers.map((player) => `${getScoreKey(player)}:${player.score ?? 0}`).join('|')
  const displayedScoreSignature = displayedScoredPlayers
    .map((player) => `${getScoreKey(player)}:${player.score ?? 0}`)
    .join('|')

  useEffect(() => {
    return () => {
      if (scoreRailCollapseTimerRef.current !== null) {
        window.clearTimeout(scoreRailCollapseTimerRef.current)
      }
      if (scoreRailCommitTimerRef.current !== null) {
        window.clearTimeout(scoreRailCommitTimerRef.current)
      }
      if (scoreRailReorderTimerRef.current !== null) {
        window.clearTimeout(scoreRailReorderTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    pendingScorePlayersRef.current = scoredPlayers
  }, [scoredPlayers])

  useEffect(() => {
    const previousPhase = prevPhaseRef.current
    const enteringPrepare = previousPhase !== 'prepare' && phase === 'prepare'
    const leavingPrepare = previousPhase === 'prepare' && phase !== 'prepare'

    if (leavingPrepare) {
      if (scoreRailCollapseTimerRef.current !== null) {
        window.clearTimeout(scoreRailCollapseTimerRef.current)
      }
      if (scoreRailCommitTimerRef.current !== null) {
        window.clearTimeout(scoreRailCommitTimerRef.current)
      }
      if (scoreRailReorderTimerRef.current !== null) {
        window.clearTimeout(scoreRailReorderTimerRef.current)
      }
      setIsScoreRailExpanded(false)
    }

    if (phase === 'prepare' && hasAnyScore && displayedScoredPlayers.length === 0 && !enteringPrepare) {
      setDisplayedScoredPlayers(scoredPlayers)
      prevScoreSignatureRef.current = scoreSignature
    }

    if (enteringPrepare && hasAnyScore) {
      const pendingPlayers = pendingScorePlayersRef.current
      const pendingSignature = pendingPlayers.map((player) => `${getScoreKey(player)}:${player.score ?? 0}`).join('|')

      if (displayedScoreSignature && displayedScoreSignature !== pendingSignature) {
        animateScoreRailOnNextDisplayRef.current = true
        setIsScoreRailExpanded(true)

        if (scoreRailCollapseTimerRef.current !== null) {
          window.clearTimeout(scoreRailCollapseTimerRef.current)
        }
        if (scoreRailCommitTimerRef.current !== null) {
          window.clearTimeout(scoreRailCommitTimerRef.current)
        }
        if (scoreRailReorderTimerRef.current !== null) {
          window.clearTimeout(scoreRailReorderTimerRef.current)
        }

        scoreRailCommitTimerRef.current = window.setTimeout(() => {
          setDisplayedScoredPlayers(pendingPlayers)
        }, SCORE_RAIL_UPDATE_DELAY_MS)
      } else if (!displayedScoreSignature) {
        animateScoreRailOnNextDisplayRef.current = true
        setIsScoreRailExpanded(false)

        if (scoreRailCollapseTimerRef.current !== null) {
          window.clearTimeout(scoreRailCollapseTimerRef.current)
        }
        if (scoreRailCommitTimerRef.current !== null) {
          window.clearTimeout(scoreRailCommitTimerRef.current)
        }
        if (scoreRailReorderTimerRef.current !== null) {
          window.clearTimeout(scoreRailReorderTimerRef.current)
        }

        setDisplayedScoredPlayers(pendingPlayers)
        prevScoreSignatureRef.current = ''

        scoreRailCommitTimerRef.current = window.setTimeout(() => {
          setIsScoreRailExpanded(true)
        }, 24)

        scoreRailCollapseTimerRef.current = window.setTimeout(() => {
          setIsScoreRailExpanded(false)
        }, SCORE_RAIL_EXPAND_MS + SCORE_RAIL_POST_REORDER_CLOSE_MS)
      }
    }

    prevPhaseRef.current = phase
  }, [displayedScoreSignature, displayedScoredPlayers.length, hasAnyScore, phase, scoreSignature, scoredPlayers])

  useLayoutEffect(() => {
    const isNewScoreState =
      animateScoreRailOnNextDisplayRef.current && prevScoreSignatureRef.current !== displayedScoreSignature

    if (!showPrepareScoreRail) {
      prevScorePositionsRef.current = {}
      return
    }

    const previousPositions = prevScorePositionsRef.current
    const currentPositions: Record<string, DOMRect> = {}

    displayedScoredPlayers.forEach((player) => {
      const key = getScoreKey(player)
      const element = scoreItemRefs.current[key]
      if (!element) {
        return
      }

      const nextRect = element.getBoundingClientRect()
      currentPositions[key] = nextRect

      const prevRect = previousPositions[key]
      if (!prevRect) {
        if (isNewScoreState) {
          gsap.set(element, { opacity: 0, x: 12, scale: 0.985, force3D: true })
        } else {
          gsap.set(element, { clearProps: 'transform,opacity' })
        }
        return
      }

      const deltaY = prevRect.top - nextRect.top
      if (Math.abs(deltaY) > 1) {
        const movedUp = deltaY > 0
        gsap.killTweensOf(element)

        if (isNewScoreState) {
          gsap.set(
            element,
            movedUp
              ? {
                  y: deltaY,
                  x: -6,
                  scale: 1.035,
                  zIndex: 8,
                  boxShadow: '0 20px 34px rgba(0, 0, 0, 0.26)',
                  force3D: true,
                }
              : {
                  y: deltaY,
                  scale: 0.985,
                  opacity: 0.94,
                  zIndex: 2,
                  force3D: true,
                }
          )
        } else {
          gsap.set(element, { clearProps: 'transform,zIndex,boxShadow,opacity' })
        }
      }
    })

    if (scoreRailReorderTimerRef.current !== null) {
      window.clearTimeout(scoreRailReorderTimerRef.current)
    }

    if (isNewScoreState) {
      scoreRailReorderTimerRef.current = window.setTimeout(() => {
        let longestDuration = 0

        displayedScoredPlayers.forEach((player) => {
          const key = getScoreKey(player)
          const element = scoreItemRefs.current[key]
          if (!element) {
            return
          }

          const prevRect = previousPositions[key]
          if (!prevRect) {
            gsap.to(element, {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.34,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
            })
            return
          }

          const nextRect = currentPositions[key]
          const deltaY = prevRect.top - nextRect.top
          const movedUp = deltaY > 0
          const duration = movedUp ? 0.64 : 0.52
          longestDuration = Math.max(longestDuration, duration)

          gsap.to(
            element,
            movedUp
              ? {
                  y: 0,
                  x: 0,
                  scale: 1,
                  opacity: 1,
                  zIndex: 0,
                  boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
                  duration,
                  ease: 'power2.inOut',
                  clearProps: 'transform,zIndex,boxShadow,opacity',
                }
              : {
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  zIndex: 0,
                  duration,
                  ease: 'power2.out',
                  clearProps: 'transform,zIndex,opacity',
                }
          )
        })

        if (scoreRailCollapseTimerRef.current !== null) {
          window.clearTimeout(scoreRailCollapseTimerRef.current)
        }

        scoreRailCollapseTimerRef.current = window.setTimeout(() => {
          setIsScoreRailExpanded(false)
        }, Math.round(longestDuration * 1000) + SCORE_RAIL_POST_REORDER_CLOSE_MS)
      }, SCORE_RAIL_REORDER_DELAY_MS)
    }

    prevScorePositionsRef.current = currentPositions
    prevScoreSignatureRef.current = displayedScoreSignature
    animateScoreRailOnNextDisplayRef.current = false
  }, [displayedScoreSignature, displayedScoredPlayers, showPrepareScoreRail])

  function toggleScoreRail() {
    if (scoreRailCollapseTimerRef.current !== null) {
      window.clearTimeout(scoreRailCollapseTimerRef.current)
    }
    setIsScoreRailExpanded((current) => !current)
  }

  return {
    displayedScoredPlayers,
    isScoreRailExpanded,
    scoreItemRefs,
    showPrepareScoreRail,
    toggleScoreRail,
  }
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './PlayBoard.module.css'
import { CardBack, SettledCard } from './PlayBoardCards'
import {
  BufferView,
  PrepareView,
  RoundSummaryView,
  TimerRunningView,
  VerdictView,
} from './PlayBoardPhases'
import {
  getCenterDeckCardStyle,
  getCornerDeckCardStyle,
  getRankedPlayers,
  getScoreKey,
  toLocalPoint,
} from './playboard-helpers'
import type { CardPoint, Phase, PlayBoardProps, PlayerSummary, RankedPlayer } from './playboard-types'
import { usePrepareScoreRail } from './usePrepareScoreRail'

const COLLECT_DURATION = 0.22
const DEAL_DURATION = 0.62
const BETWEEN_COLLECT_MS = 30
const BETWEEN_DEAL_MS = 110
export function PlayBoard({
  phase,
  players,
  order,
  currentOrderIdx,
  presenter,
  currentWord,
  isRoundOrderRevealing,
  onRoundOrderSettled,
  timerRemaining,
  bufferRemaining = 0,
  currentRound,
  totalRounds,
  animationsEnabled = true,
}: PlayBoardProps) {
  const totalCards = order.length > 0 ? order.length : players.length
  const [centerCount, setCenterCount] = useState(totalCards)
  const [cornerCount, setCornerCount] = useState(0)
  const [settledCount, setSettledCount] = useState(0)
  const [landedSlotIndex, setLandedSlotIndex] = useState<number | null>(null)
  const [showFlyCard, setShowFlyCard] = useState(false)
  const [flyCardFace, setFlyCardFace] = useState<'back' | 'front'>('back')
  const [flyCardPlayer, setFlyCardPlayer] = useState<PlayerSummary | null>(null)
  const [flyCardOrderIndex, setFlyCardOrderIndex] = useState<number | null>(null)
  const [positionsReady, setPositionsReady] = useState(false)
  const [isVerdictWordVisible, setIsVerdictWordVisible] = useState(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const revealAreaRef = useRef<HTMLDivElement | null>(null)
  const centerAnchorRef = useRef<HTMLDivElement | null>(null)
  const cornerAnchorRef = useRef<HTMLDivElement | null>(null)
  const flyCardRef = useRef<HTMLDivElement | null>(null)
  const flyCardInnerRef = useRef<HTMLDivElement | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const settledPlayers = order.slice(0, settledCount)
  const rankedPlayers = useMemo<RankedPlayer[]>(
    () => getRankedPlayers(players),
    [players]
  )
  const topScore = rankedPlayers[0]?.score ?? 0
  const leaders = rankedPlayers.filter((player) => (player.score ?? 0) === topScore).map((player) => player.name)
  const {
    displayedScoredPlayers,
    isScoreRailExpanded,
    scoreItemRefs,
    showPrepareScoreRail,
    toggleScoreRail,
  } = usePrepareScoreRail({
    phase,
    scoredPlayers: rankedPlayers.filter((player) => (player.score ?? 0) > 0),
  })

  useEffect(() => {
    if (phase !== 'round-order') {
      timelineRef.current?.kill()
      timelineRef.current = null
      setCenterCount(totalCards)
      setCornerCount(0)
      setSettledCount(0)
      setLandedSlotIndex(null)
      setShowFlyCard(false)
      setFlyCardFace('back')
      setFlyCardPlayer(null)
      setFlyCardOrderIndex(null)
      setPositionsReady(false)
      return
    }

    if (!isRoundOrderRevealing) {
      timelineRef.current?.kill()
      timelineRef.current = null
      setCenterCount(totalCards)
      setCornerCount(0)
      setSettledCount(0)
      setLandedSlotIndex(null)
      setShowFlyCard(false)
      setFlyCardFace('back')
      setFlyCardPlayer(null)
      setFlyCardOrderIndex(null)
      return
    }
    if (!animationsEnabled) {
      timelineRef.current?.kill()
      timelineRef.current = null
      setCenterCount(0)
      setCornerCount(0)
      setSettledCount(order.length)
      setLandedSlotIndex(null)
      setShowFlyCard(false)
      setFlyCardFace('back')
      setFlyCardPlayer(null)
      setFlyCardOrderIndex(null)
      setPositionsReady(true)
      return
    }
  }, [animationsEnabled, order.length, phase, isRoundOrderRevealing, totalCards])

  useLayoutEffect(() => {
    if (phase !== 'round-order' || !isRoundOrderRevealing || order.length === 0 || !animationsEnabled) {
      return
    }

    const revealArea = revealAreaRef.current
    const centerAnchor = centerAnchorRef.current
    const cornerAnchor = cornerAnchorRef.current

    if (!revealArea || !centerAnchor || !cornerAnchor) {
      return
    }

    const measure = () => {
      const revealRect = revealArea.getBoundingClientRect()
      const centerRect = centerAnchor.getBoundingClientRect()
      const cornerRect = cornerAnchor.getBoundingClientRect()

      const hasSlots = order.every((_, index) => slotRefs.current[index])
      if (!hasSlots) {
        setPositionsReady(false)
        return
      }

      const center = toLocalPoint(centerRect, revealRect)
      const corner = toLocalPoint(cornerRect, revealRect)
      const slots = order.map((_, index) => {
        const slot = slotRefs.current[index]
        return slot ? toLocalPoint(slot.getBoundingClientRect(), revealRect) : null
      })

      const allSlotsReady = slots.every(Boolean)
      if (!allSlotsReady) {
        setPositionsReady(false)
        return
      }

      setPositionsReady(true)

      timelineRef.current?.kill()
      timelineRef.current = buildRoundOrderTimeline({
        center,
        corner,
        slots: slots as CardPoint[],
      })
    }

    const raf = window.requestAnimationFrame(measure)
    window.addEventListener('resize', measure)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      timelineRef.current?.kill()
      timelineRef.current = null
    }
  }, [animationsEnabled, phase, isRoundOrderRevealing, order, currentOrderIdx])

  useEffect(() => {
    if (phase !== 'verdict') {
      setIsVerdictWordVisible(false)
    }
  }, [phase, currentWord])

  useEffect(() => {
    if (
      phase === 'round-order' &&
      isRoundOrderRevealing &&
      positionsReady &&
      order.length > 0 &&
      settledCount === order.length
    ) {
      onRoundOrderSettled()
    }
  }, [phase, isRoundOrderRevealing, positionsReady, settledCount, order.length, onRoundOrderSettled])

  function buildRoundOrderTimeline({
    center,
    corner,
    slots,
  }: {
    center: CardPoint
    corner: CardPoint
    slots: CardPoint[]
  }) {
    const flyCard = flyCardRef.current
    const flyCardInner = flyCardInnerRef.current

    if (!flyCard || !flyCardInner) {
      return null
    }

    const timeline = gsap.timeline()

    gsap.set(flyCard, {
      x: center.x,
      y: center.y,
      rotation: 0,
      scale: 1,
      opacity: 0,
    })
    gsap.set(flyCardInner, {
      rotateY: 0,
      transformPerspective: 1200,
      transformStyle: 'preserve-3d',
    })

    for (let index = 0; index < totalCards; index += 1) {
      timeline.add(() => {
        setShowFlyCard(true)
        setFlyCardFace('back')
        setFlyCardPlayer(null)
        setFlyCardOrderIndex(null)
        setCenterCount(totalCards - index)
        setCornerCount(index)
        gsap.set(flyCard, {
          x: center.x,
          y: center.y,
          rotation: -2,
          scale: 1,
          opacity: 1,
        })
        gsap.set(flyCardInner, { rotateY: 0 })
      })

      timeline.to(
        flyCard,
        {
          x: corner.x,
          y: corner.y,
          rotation: -10,
          duration: COLLECT_DURATION,
          ease: 'power2.inOut',
        },
        '>'
      )

      timeline.add(() => {
        setShowFlyCard(false)
        setFlyCardOrderIndex(null)
        setCenterCount(totalCards - index - 1)
        setCornerCount(index + 1)
      })

      timeline.to({}, { duration: BETWEEN_COLLECT_MS / 1000 })
    }

    for (let index = 0; index < order.length; index += 1) {
      const player = order[index]
      const slot = slots[index]

      timeline.add(() => {
        setShowFlyCard(true)
        setFlyCardFace('back')
        setFlyCardPlayer(player)
        setFlyCardOrderIndex(index + 1)
        setCornerCount(totalCards - index)
        gsap.set(flyCard, {
          x: corner.x,
          y: corner.y,
          rotation: -10,
          scale: 1,
          opacity: 1,
        })
        gsap.set(flyCardInner, { rotateY: 0 })
      })

      timeline.to(
        flyCard,
        {
          x: slot.x,
          y: slot.y,
          rotation: 0,
          duration: DEAL_DURATION,
          ease: 'power3.out',
        },
        '>'
      )

      timeline.to(
        flyCardInner,
        {
          rotateY: 180,
          duration: DEAL_DURATION * 0.7,
          ease: 'power2.out',
          onStart: () => {
            setFlyCardFace('front')
          },
        },
        '<+0.1'
      )

      timeline.to(
        flyCard,
        {
          opacity: 0,
          duration: 0.04,
          ease: 'none',
        },
        '>'
      )

      timeline.add(() => {
        setShowFlyCard(false)
        setFlyCardFace('back')
        setFlyCardPlayer(null)
        setFlyCardOrderIndex(null)
        setCornerCount(totalCards - index - 1)
        gsap.set(flyCard, { opacity: 1 })
        window.requestAnimationFrame(() => {
          setLandedSlotIndex(index)
          setSettledCount(index + 1)
        })
      })

      timeline.to({}, { duration: 0.12 })

      timeline.add(() => {
        setLandedSlotIndex((current) => (current === index ? null : current))
      })

      timeline.to({}, { duration: BETWEEN_DEAL_MS / 1000 })
    }

    return timeline
  }

  if (phase === 'round-order') {
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          {!isRoundOrderRevealing ? (
            <div className={styles.deckArea} aria-label="Zakryte karty graczy">
              <div className={styles.centerDeck}>
                <div ref={centerAnchorRef} className={styles.centerAnchor} aria-hidden="true" />
                {Array.from({ length: totalCards }).map((_, index) => (
                  <div
                    key={`center-${index}`}
                    className={`${styles.deckCard} ${styles.centerDeckCard}`}
                    style={getCenterDeckCardStyle(index)}
                  >
                    <CardBack branded />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div ref={revealAreaRef} className={styles.revealArea}>
              <div className={styles.centerDeckShell} aria-hidden="true">
                <div className={styles.centerDeck}>
                  <div ref={centerAnchorRef} className={styles.centerAnchor} />
                  {Array.from({ length: centerCount }).map((_, index) => (
                    <div
                      key={`collect-center-${index}`}
                      className={`${styles.deckCard} ${styles.centerDeckCard}`}
                      style={getCenterDeckCardStyle(index)}
                    >
                      <CardBack branded />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.orderList}>
                {order.map((player, index) => (
                  <div
                    key={`${player.name}-${index}`}
                    ref={(node) => {
                      slotRefs.current[index] = node
                    }}
                    className={styles.orderSlot}
                  >
                    {index < settledCount ? (
                      <SettledCard
                        player={settledPlayers[index]}
                        index={index}
                        isActive={landedSlotIndex === index}
                      />
                    ) : (
                      <div className={styles.orderCardPending} />
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.cornerDeckShell} aria-hidden="true">
                <div className={styles.cornerDeck}>
                  <div ref={cornerAnchorRef} className={styles.cornerAnchor} />
                  {Array.from({ length: cornerCount }).map((_, index, items) => (
                    <div
                      key={`corner-${index}`}
                      className={`${styles.deckCard} ${styles.cornerDeckCard}`}
                      style={getCornerDeckCardStyle(index, items.length)}
                    >
                      <CardBack branded />
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={flyCardRef}
                className={`${styles.flyCard} ${showFlyCard ? styles.flyCardVisible : ''}`}
                aria-hidden="true"
              >
                <div ref={flyCardInnerRef} className={styles.orderCardInner}>
                  <div className={styles.orderCardBack}>
                    <CardBack branded />
                  </div>
                  <div className={styles.orderCardFront}>
                    {flyCardFace === 'front' && flyCardPlayer ? (
                      <>
                        <span className={styles.orderIndex}>{flyCardOrderIndex ?? ''}</span>
                        <span className={styles.orderAvatar}>{flyCardPlayer.avatar}</span>
                        <span className={styles.namePill} data-gender={flyCardPlayer.gender}>
                          {flyCardPlayer.name}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    )
  }

  if (phase === 'timer-running') {
    return <TimerRunningView presenter={presenter} timerRemaining={timerRemaining} />
  }

  if (phase === 'verdict') {
    return (
      <VerdictView
        presenter={presenter}
        currentWord={currentWord}
        isVerdictWordVisible={isVerdictWordVisible}
        onToggleWordVisibility={() => setIsVerdictWordVisible((current) => !current)}
      />
    )
  }

  if (phase === 'round-summary') {
    return (
      <RoundSummaryView
        currentRound={currentRound}
        totalRounds={totalRounds}
        leaders={leaders}
        topScore={topScore}
        rankedPlayers={rankedPlayers}
      />
    )
  }

  if (phase === 'prepare') {
    return (
      <PrepareView
        presenter={presenter}
        showScoreRail={showPrepareScoreRail}
        isScoreRailExpanded={isScoreRailExpanded}
        displayedScoredPlayers={displayedScoredPlayers}
        scoreItemRefs={scoreItemRefs}
        onToggleScoreRail={toggleScoreRail}
        getScoreKey={getScoreKey}
      />
    )
  }

  return <BufferView presenter={presenter} bufferRemaining={bufferRemaining} />
}


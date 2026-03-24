import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import styles from './PlayBoard.module.css'

type PlayerSummary = {
  name: string
  avatar: string
  gender: 'on' | 'ona' | 'none'
  score?: number
}

type Phase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

type PlayBoardProps = {
  phase: Phase
  players: PlayerSummary[]
  order: PlayerSummary[]
  currentOrderIdx: number
  presenter: PlayerSummary | undefined
  currentWord: string
  isRoundOrderRevealing: boolean
  onRoundOrderSettled: () => void
  timerRemaining: number
  bufferRemaining?: number
  currentRound: number
  totalRounds: number
}

type CardPoint = {
  x: number
  y: number
}

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
  const [isScoreRailExpanded, setIsScoreRailExpanded] = useState(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const scoreRailRef = useRef<HTMLDivElement | null>(null)
  const scoreItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevScorePositionsRef = useRef<Record<string, DOMRect>>({})
  const prevScoreRailVisibleRef = useRef(false)
  const scoreRailCollapseTimerRef = useRef<number | null>(null)
  const scoreRailReorderTimerRef = useRef<number | null>(null)
  const prevScoreSignatureRef = useRef('')
  const scoreAnimationPendingRef = useRef(false)
  const revealAreaRef = useRef<HTMLDivElement | null>(null)
  const centerAnchorRef = useRef<HTMLDivElement | null>(null)
  const cornerAnchorRef = useRef<HTMLDivElement | null>(null)
  const flyCardRef = useRef<HTMLDivElement | null>(null)
  const flyCardInnerRef = useRef<HTMLDivElement | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const settledPlayers = order.slice(0, settledCount)
  const rankedPlayers = [...players]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name))
    .map((player, index, list) => {
      const prev = list[index - 1]
      const sameAsPrev = prev && (prev.score ?? 0) === (player.score ?? 0)
      const rank = sameAsPrev ? ((list[index - 1] as PlayerSummary & { rank?: number }).rank ?? index) : index + 1
      return { ...player, rank }
    })
  const topScore = rankedPlayers[0]?.score ?? 0
  const leaders = rankedPlayers.filter((player) => (player.score ?? 0) === topScore).map((player) => player.name)
  const scoredPlayers = rankedPlayers.filter((player) => (player.score ?? 0) > 0)
  const hasAnyScore = scoredPlayers.length > 0
  const showPrepareScoreRail = phase === 'prepare' && hasAnyScore
  const scoreSignature = scoredPlayers.map((player) => `${getScoreKey(player)}:${player.score ?? 0}`).join('|')

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
  }, [phase, isRoundOrderRevealing, totalCards])

  useLayoutEffect(() => {
    if (phase !== 'round-order' || !isRoundOrderRevealing || order.length === 0) {
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
  }, [phase, isRoundOrderRevealing, order, currentOrderIdx])

  useEffect(() => {
    if (phase !== 'verdict') {
      setIsVerdictWordVisible(false)
    }
  }, [phase, currentWord])

  useEffect(() => {
    return () => {
      if (scoreRailCollapseTimerRef.current !== null) {
        window.clearTimeout(scoreRailCollapseTimerRef.current)
      }
      if (scoreRailReorderTimerRef.current !== null) {
        window.clearTimeout(scoreRailReorderTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!showPrepareScoreRail) {
      if (scoreRailCollapseTimerRef.current !== null) {
        window.clearTimeout(scoreRailCollapseTimerRef.current)
      }
      if (scoreRailReorderTimerRef.current !== null) {
        window.clearTimeout(scoreRailReorderTimerRef.current)
      }
      setIsScoreRailExpanded(false)
      prevScoreSignatureRef.current = ''
      return
    }

    const isNewScoreState = prevScoreSignatureRef.current !== scoreSignature
    if (isNewScoreState) {
      scoreAnimationPendingRef.current = true
      setIsScoreRailExpanded(true)

      if (scoreRailCollapseTimerRef.current !== null) {
        window.clearTimeout(scoreRailCollapseTimerRef.current)
      }

      scoreRailCollapseTimerRef.current = window.setTimeout(() => {
        setIsScoreRailExpanded(false)
      }, 3900)
    }

    prevScoreSignatureRef.current = scoreSignature
  }, [showPrepareScoreRail, scoreSignature])

  useLayoutEffect(() => {
    const visible = showPrepareScoreRail
    const isNewScoreState = scoreAnimationPendingRef.current

    if (!visible) {
      prevScorePositionsRef.current = {}
      prevScoreRailVisibleRef.current = false
      return
    }

    const previousPositions = prevScorePositionsRef.current
    const currentPositions: Record<string, DOMRect> = {}

    scoredPlayers.forEach((player) => {
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
          gsap.set(element, { opacity: 0, x: 18 })
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
                  scale: 1.02,
                  zIndex: 6,
                  boxShadow: '0 18px 28px rgba(0, 0, 0, 0.24)',
                }
              : {
                  y: deltaY,
                  zIndex: 2,
                }
          )
        } else {
          gsap.set(element, { clearProps: 'transform,zIndex,boxShadow' })
        }
      }
    })

    if (scoreRailReorderTimerRef.current !== null) {
      window.clearTimeout(scoreRailReorderTimerRef.current)
    }

    if (isNewScoreState) {
      scoreRailReorderTimerRef.current = window.setTimeout(() => {
        scoredPlayers.forEach((player) => {
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
              duration: 0.28,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
            })
            return
          }

          const nextRect = currentPositions[key]
          const deltaY = prevRect.top - nextRect.top
          const movedUp = deltaY > 0

          gsap.to(element, movedUp
            ? {
                y: 0,
                scale: 1,
                zIndex: 0,
                boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
                duration: 0.52,
                ease: 'power3.out',
                clearProps: 'transform,zIndex,boxShadow',
              }
            : {
                y: 0,
                zIndex: 0,
                duration: 0.42,
                ease: 'power2.out',
                clearProps: 'transform,zIndex',
              })
        })
      }, 500)
      scoreAnimationPendingRef.current = false
    }

    prevScorePositionsRef.current = currentPositions
    prevScoreRailVisibleRef.current = true
  }, [showPrepareScoreRail, scoredPlayers, scoreSignature])

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
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          <div className={styles.prepareLayout}>
            <div className={styles.preparePlayerPane}>
              <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
            </div>

            <div className={styles.timerContent}>
              <span className={styles.eyebrow}>Prezentuj!</span>
              <div className={styles.timerHero}>
                <h1 className={styles.timerTitle}>Czas do konca prezentowania</h1>
                <div className={styles.timer}>{timerRemaining}</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'verdict') {
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          <div className={styles.prepareLayout}>
            <div className={styles.preparePlayerPane}>
              <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
            </div>

            <div className={styles.verdictContent}>
              <span className={styles.eyebrow}>Werdykt</span>
              <div className={styles.verdictHero}>
                <h1 className={styles.verdictTitle}>Czy haslo zostalo odgadniete?</h1>
                {currentWord ? (
                  <>
                    <button
                      type="button"
                      className={styles.verdictRevealButton}
                      onClick={() => setIsVerdictWordVisible((current) => !current)}
                    >
                      {isVerdictWordVisible ? 'Ukryj haslo' : 'Pokaz haslo'}
                    </button>
                    <div className={styles.verdictWordSlot}>
                      <div
                        className={styles.verdictWord}
                        data-visible={isVerdictWordVisible}
                        aria-hidden={!isVerdictWordVisible}
                      >
                        {currentWord}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
              <div className={styles.verdictNote}>
                <span className={styles.verdictNoteLabel}>Decyzja hosta</span>
                <p className={styles.verdictNoteText}>
                  Wybierz w dolnym pasku, czy prezentowane haslo zostalo odgadniete.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'round-summary') {
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          <div className={styles.summaryScreen}>
            <span className={styles.eyebrow}>Podsumowanie rundy</span>
            <div className={styles.summaryHero}>
              <h1 className={styles.summaryTitle}>
                Podsumowanie rundy {currentRound}/{totalRounds}
              </h1>
              <p className={styles.summaryLead}>
                {leaders.length > 0
                  ? `Aktualni liderzy: ${leaders.join(', ')} (${topScore})`
                  : 'Po tej rundzie nadal nie ma zdobytych punktow.'}
              </p>
            </div>

            <div className={styles.summaryRanking}>
              {rankedPlayers.map((player) => (
                <div key={player.name} className={styles.summaryRow} data-rank={player.rank}>
                  <span className={styles.summaryRank}>#{player.rank}</span>
                  <span className={styles.summaryAvatar}>{player.avatar}</span>
                  <span className={styles.summaryName} data-gender={player.gender}>
                    {player.name}
                  </span>
                  <span className={styles.summaryScore}>{player.score ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'prepare') {
    return (
      <main className={`${styles.board} ${styles.boardPrepare}`}>
        <section className={`${styles.stage} ${styles.stagePrepare}`}>
          <div className={styles.prepareScene}>
            <div className={styles.prepareLayout}>
              <div className={styles.preparePlayerPane}>
                <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
              </div>

              <div className={styles.prepareContent}>
                <span className={styles.eyebrow}>Za chwile start</span>
                <div className={styles.prepareHero}>
                  <h1 className={styles.title}>Haslo czeka na urzadzeniu prezentera</h1>
                </div>

                <div className={styles.stepList}>
                  <div className={styles.stepItem}>
                    <span className={styles.stepIndex}>1</span>
                    <p>Po kliknieciu "Odkryj haslo" prezenter ma 10 sekund, by zapoznac sie z haslem.</p>
                  </div>
                  <div className={styles.stepItem}>
                    <span className={styles.stepIndex}>2</span>
                    <p>Po tym czasie uruchomi sie glowny licznik na prezentowanie hasla.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showPrepareScoreRail && (
          <aside ref={scoreRailRef} className={styles.scoreRail} data-expanded={isScoreRailExpanded}>
            <button
              type="button"
              className={styles.scoreRailToggle}
              data-expanded={isScoreRailExpanded}
              onClick={() => {
                if (scoreRailCollapseTimerRef.current !== null) {
                  window.clearTimeout(scoreRailCollapseTimerRef.current)
                }
                setIsScoreRailExpanded((current) => !current)
              }}
              aria-label={isScoreRailExpanded ? 'Schowaj wynik' : 'Pokaz wynik'}
            >
              <span className={styles.scoreRailToggleIcon} aria-hidden="true">
                {isScoreRailExpanded ? '›' : '‹'}
              </span>
            </button>

            <div className={styles.scoreRailHeader}>
              <span className={styles.scoreRailLabel}>Wynik</span>
            </div>
            <div className={styles.scoreRailList}>
              {scoredPlayers.map((player) => {
                const key = getScoreKey(player)
                return (
                  <div
                    key={key}
                    ref={(element) => {
                      scoreItemRefs.current[key] = element
                    }}
                    className={styles.scoreRailItem}
                    data-rank={scoredPlayers[0]?.score === (player.score ?? 0) ? 'leader' : 'chasing'}
                  >
                    <span className={styles.scoreRailAvatar}>{player.avatar}</span>
                    <span className={styles.scoreRailName} data-gender={player.gender}>
                      {player.name}
                    </span>
                    <span className={styles.scoreRailPoints}>{player.score ?? 0}</span>
                  </div>
                )
              })}
            </div>
          </aside>
        )}
      </main>
    )
  }

  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.bufferContent}>
            <span className={styles.eyebrow}>Zapamietaj haslo</span>
            <div className={styles.bufferHero}>
              <h1 className={styles.bufferTitle}>Prezenter zapoznaje sie z haslem</h1>
              <div className={styles.bufferTimerWrap}>
                <div className={styles.timer}>{bufferRemaining}</div>
                <span className={styles.bufferTimerLabel}>sekund do startu tury</span>
              </div>
            </div>
            <div className={styles.bufferSideNote}>
              <span className={styles.bufferSideNoteLabel}>Na planszy</span>
              <p className={styles.bufferHint}>
                To jest moment tylko dla prezentera. Reszta graczy czeka na start tury.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function SettledCard({
  player,
  index,
  isActive,
}: {
  player: PlayerSummary | undefined
  index: number
  isActive: boolean
}) {
  return (
    <div className={isActive ? styles.orderCardSettledActive : styles.orderCardSettled}>
      <div className={styles.orderCardInner}>
        <div className={styles.orderCardBack}>
          <CardBack branded />
        </div>
        <div className={styles.orderCardFront}>
          <span className={styles.orderIndex}>{index + 1}</span>
          <span className={styles.orderAvatar}>{player?.avatar ?? '??'}</span>
          <span className={styles.namePill} data-gender={player?.gender ?? 'none'}>
            {player?.name ?? 'Brak gracza'}
          </span>
        </div>
      </div>
    </div>
  )
}

function toLocalPoint(rect: DOMRect, container: DOMRect): CardPoint {
  return {
    x: rect.left - container.left,
    y: rect.top - container.top,
  }
}

function getCenterDeckCardStyle(index: number) {
  return {
    '--stack-x': `${index * 0.9}px`,
    '--stack-y': `${index * 1.1}px`,
    '--stack-rotate': `${index * 0.45}deg`,
    '--stack-z': index + 1,
  } as CSSProperties
}

function getCornerDeckCardStyle(index: number, total: number) {
  return {
    '--corner-fan-x': `${index * 0.9}px`,
    '--corner-fan-y': `${index * 1.1}px`,
    '--corner-fan-rotate': `${index * 0.45}deg`,
    '--corner-z': index + 1,
  } as CSSProperties
}

function getScoreKey(player: PlayerSummary) {
  return `${player.name}-${player.avatar}-${player.gender}`
}

function CardBack({ branded = false }: { branded?: boolean }) {
  return (
    <div className={styles.cardBackFace}>
      <span className={styles.cardBackCorner}>{branded ? 'K' : ''}</span>
      <div className={styles.cardBackCenter}>
        {branded && <span className={styles.cardBackLabel}>Kalambury</span>}
      </div>
      <span className={styles.cardBackCorner}>{branded ? 'K' : ''}</span>
    </div>
  )
}

function PresenterCard({
  presenter,
  subtitle,
  compact = false,
  featured = false,
}: {
  presenter: PlayerSummary | undefined
  subtitle: string
  compact?: boolean
  featured?: boolean
}) {
  return (
    <div
      className={
        compact ? styles.presenterCardCompact : featured ? styles.presenterCardFeatured : styles.presenterCard
      }
    >
      <span className={featured ? styles.presenterBadgeFeatured : styles.presenterSubtitle}>{subtitle}</span>
      <span className={featured ? styles.presenterAvatarFeatured : styles.presenterAvatar}>
        {presenter?.avatar ?? '??'}
      </span>
      <div className={styles.presenterMeta}>
        <span
          className={featured ? styles.presenterNamePill : styles.presenterName}
          data-gender={presenter?.gender ?? 'none'}
        >
          {presenter?.name ?? 'Brak gracza'}
        </span>
      </div>
    </div>
  )
}


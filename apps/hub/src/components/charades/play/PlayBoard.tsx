import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import styles from './PlayBoard.module.css'

type PlayerSummary = {
  name: string
  avatar: string
  gender: 'on' | 'ona' | 'none'
}

type Phase =
  | 'round-order'
  | 'prepare'
  | 'waiting-ready'
  | 'timer-running'
  | 'verdict'

type PlayBoardProps = {
  phase: Phase
  players: PlayerSummary[]
  order: PlayerSummary[]
  currentOrderIdx: number
  presenter: PlayerSummary | undefined
  isRoundOrderRevealing: boolean
  onRoundOrderSettled: () => void
  timerRemaining: number
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
  isRoundOrderRevealing,
  onRoundOrderSettled,
  timerRemaining,
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
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const revealAreaRef = useRef<HTMLDivElement | null>(null)
  const centerAnchorRef = useRef<HTMLDivElement | null>(null)
  const cornerAnchorRef = useRef<HTMLDivElement | null>(null)
  const flyCardRef = useRef<HTMLDivElement | null>(null)
  const flyCardInnerRef = useRef<HTMLDivElement | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const settledPlayers = order.slice(0, settledCount)

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
          <PresenterCard presenter={presenter} subtitle="Prezenter" compact />
          <div className={styles.copy}>
            <div className={styles.timer}>{timerRemaining}</div>
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'verdict') {
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          <PresenterCard presenter={presenter} subtitle="Prezenter" />
          <div className={styles.copy}>
            <h1 className={styles.title}>Czy zgadli?</h1>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <PresenterCard presenter={presenter} subtitle="Prezenter" />
        <div className={styles.copy}>
          <h1 className={styles.title}>Podaj telefon</h1>
          <p className={styles.message}>
            {phase === 'prepare'
              ? 'Wyslij haslo na telefon prezentera.'
              : 'Czekamy, az prezenter kliknie "Gotowy".'}
          </p>
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
}: {
  presenter: PlayerSummary | undefined
  subtitle: string
  compact?: boolean
}) {
  return (
    <div className={compact ? styles.presenterCardCompact : styles.presenterCard}>
      <span className={styles.presenterAvatar}>{presenter?.avatar ?? '??'}</span>
      <div className={styles.presenterMeta}>
        <p className={styles.presenterName}>{presenter?.name ?? 'Brak gracza'}</p>
        <p className={styles.presenterSubtitle}>{subtitle}</p>
      </div>
    </div>
  )
}

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import styles from './PlayBoard.module.css'

type PlayerSummary = {
  name: string
  avatar: string
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
  onFinishRoundOrder: () => void
  timerRemaining: number
}

const CARD_REVEAL_MS = 380
const CARD_SETTLE_MS = 980
const ORDER_HOLD_MS = 3000
const ORDER_COLUMNS = 4

export function PlayBoard({
  phase,
  players,
  order,
  currentOrderIdx,
  presenter,
  isRoundOrderRevealing,
  onFinishRoundOrder,
  timerRemaining,
}: PlayBoardProps) {
  const totalCards = order.length > 0 ? order.length : players.length
  const [revealedCount, setRevealedCount] = useState(0)
  const [settledCount, setSettledCount] = useState(0)
  const [collectedCount, setCollectedCount] = useState(0)
  const [dealOffsets, setDealOffsets] = useState<Record<number, { x: number; y: number }>>({})
  const [collectOffset, setCollectOffset] = useState<{ x: number; y: number } | null>(null)
  const finishScheduledRef = useRef(false)
  const animationRefs = useRef<Partial<Record<number, gsap.core.Animation>>>({})
  const revealAreaRef = useRef<HTMLDivElement | null>(null)
  const deckLaunchRef = useRef<HTMLDivElement | null>(null)
  const centerDeckRef = useRef<HTMLDivElement | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const dealingCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const dealingInnerRefs = useRef<(HTMLDivElement | null)[]>([])
  const collectingCardRef = useRef<HTMLDivElement | null>(null)
  const collectingInnerRef = useRef<HTMLDivElement | null>(null)
  const collectAnimationRef = useRef<gsap.core.Animation | null>(null)
  const stackedDeckCount = players.length
  const remainingDeckCount = Math.max(order.length - revealedCount, 0)
  const totalRows = Math.max(1, Math.ceil(order.length / ORDER_COLUMNS))
  const areDealOffsetsReady = order.length > 0 && Object.keys(dealOffsets).length === order.length
  const isCollectPhase = isRoundOrderRevealing && collectedCount < totalCards
  const isDealPhase = isRoundOrderRevealing && collectedCount >= totalCards

  useEffect(() => {
    if (phase !== 'round-order') {
      setRevealedCount(0)
      setSettledCount(0)
      setCollectedCount(0)
      setDealOffsets({})
      setCollectOffset(null)
      finishScheduledRef.current = false
      Object.values(animationRefs.current).forEach((animation) => animation?.kill())
      animationRefs.current = {}
      collectAnimationRef.current?.kill()
      collectAnimationRef.current = null
      return
    }

    if (!isRoundOrderRevealing) {
      setRevealedCount(0)
      setSettledCount(0)
      setCollectedCount(0)
      setDealOffsets({})
      setCollectOffset(null)
      finishScheduledRef.current = false
      Object.values(animationRefs.current).forEach((animation) => animation?.kill())
      animationRefs.current = {}
      collectAnimationRef.current?.kill()
      collectAnimationRef.current = null
      return
    }

    if (order.length === 0 || !areDealOffsetsReady) {
      return
    }

    setRevealedCount(0)
    setSettledCount(0)
    setCollectedCount(0)
    finishScheduledRef.current = false
    Object.values(animationRefs.current).forEach((animation) => animation?.kill())
    animationRefs.current = {}
    collectAnimationRef.current?.kill()
    collectAnimationRef.current = null
  }, [phase, isRoundOrderRevealing, order, areDealOffsetsReady])

  useEffect(() => {
    if (!isDealPhase || !areDealOffsetsReady) {
      return
    }

    let current = 0
    const revealTimer = window.setInterval(() => {
      current += 1
      setRevealedCount(Math.min(current, order.length))
      if (current >= order.length) {
        window.clearInterval(revealTimer)
      }
    }, CARD_REVEAL_MS)

    return () => window.clearInterval(revealTimer)
  }, [isDealPhase, areDealOffsetsReady, order.length])

  useLayoutEffect(() => {
    if (!isCollectPhase) {
      return
    }

    const centerDeck = centerDeckRef.current
    const cornerDeck = deckLaunchRef.current
    const card = collectingCardRef.current
    const inner = collectingInnerRef.current

    if (!centerDeck || !cornerDeck || !card || !inner || collectAnimationRef.current) {
      return
    }

    const revealRect = revealAreaRef.current?.getBoundingClientRect()
    const centerRect = centerDeck.getBoundingClientRect()
    const cornerRect = cornerDeck.getBoundingClientRect()

    if (!revealRect) {
      return
    }

    const startX = centerRect.left - revealRect.left
    const startY = centerRect.top - revealRect.top
    const endX = cornerRect.left - revealRect.left
    const endY = cornerRect.top - revealRect.top

    gsap.set(card, {
      x: startX - endX,
      y: startY - endY,
      rotation: 0,
      scale: 1,
      opacity: 1,
    })

    gsap.set(inner, {
      rotateY: 0,
      transformPerspective: 1200,
      transformStyle: 'preserve-3d',
    })

    const timeline = gsap.timeline({
      onComplete: () => {
        collectAnimationRef.current = null
        setCollectedCount((current) => current + 1)
      },
    })

    timeline.to(card, {
      x: 0,
      y: 0,
      rotation: -8,
      duration: 0.42,
      ease: 'power3.inOut',
    }, 0)

    collectAnimationRef.current = timeline

    return () => {
      timeline.kill()
      if (collectAnimationRef.current === timeline) {
        collectAnimationRef.current = null
      }
    }
  }, [isCollectPhase, collectedCount])

  useLayoutEffect(() => {
    if (!isDealPhase || revealedCount === 0) {
      return
    }

    const index = revealedCount - 1
    const offset = dealOffsets[index]
    const card = dealingCardRefs.current[index]
    const inner = dealingInnerRefs.current[index]

    if (!offset || !card || !inner) {
      return
    }

    if (animationRefs.current[index]) {
      return
    }

    gsap.set(card, {
      x: offset.x,
      y: offset.y,
      rotation: -10,
      scale: 0.94,
      opacity: 1,
    })

    gsap.set(inner, {
      rotateY: 0,
      transformPerspective: 1200,
      transformStyle: 'preserve-3d',
    })

    const timeline = gsap.timeline()
    timeline.to(card, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: CARD_SETTLE_MS / 1000,
      ease: 'power3.out',
      onComplete: () => {
        delete animationRefs.current[index]
        setSettledCount((current) => Math.max(current, index + 1))
      },
    }, 0)

    timeline.to(inner, {
      rotateY: 180,
      duration: CARD_SETTLE_MS / 1000,
      ease: 'power2.out',
    }, 0)

    animationRefs.current[index] = timeline
  }, [isDealPhase, revealedCount, dealOffsets])

  useLayoutEffect(() => {
    if (phase !== 'round-order' || !isRoundOrderRevealing) {
      return
    }

    const revealArea = revealAreaRef.current
    const deckLaunch = deckLaunchRef.current
    const centerDeck = centerDeckRef.current

    if (!revealArea || !deckLaunch || !centerDeck || order.length === 0) {
      return
    }

    const measure = () => {
      const revealRect = revealArea.getBoundingClientRect()
      const deckRect = deckLaunch.getBoundingClientRect()
      const centerRect = centerDeck.getBoundingClientRect()
      const launchX = deckRect.left - revealRect.left + 12
      const launchY = deckRect.top - revealRect.top + 12

      const nextOffsets: Record<number, { x: number; y: number }> = {}

      order.forEach((_, index) => {
        const slot = slotRefs.current[index]
        if (!slot) {
          return
        }

        const slotRect = slot.getBoundingClientRect()
        nextOffsets[index] = {
          x: launchX - (slotRect.left - revealRect.left),
          y: launchY - (slotRect.top - revealRect.top),
        }
      })

      setCollectOffset({
        x: centerRect.left - revealRect.left - launchX,
        y: centerRect.top - revealRect.top - launchY,
      })
      setDealOffsets(nextOffsets)
    }

    measure()
    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [phase, isRoundOrderRevealing, order, revealedCount, settledCount, collectedCount])

  useEffect(() => {
    if (
      phase !== 'round-order' ||
      !isDealPhase ||
      order.length === 0 ||
      settledCount !== order.length ||
      finishScheduledRef.current
    ) {
      return
    }

    finishScheduledRef.current = true
    const finishTimer = window.setTimeout(() => {
      onFinishRoundOrder()
    }, ORDER_HOLD_MS)

    return () => window.clearTimeout(finishTimer)
  }, [phase, isDealPhase, order.length, settledCount, onFinishRoundOrder])

  if (phase === 'round-order') {
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          {!isRoundOrderRevealing ? (
            <div className={styles.deckArea} aria-label="Zakryte karty graczy">
              <div ref={centerDeckRef} className={styles.deck}>
                {Array.from({ length: stackedDeckCount }).map((_, index) => (
                  <div
                    key={`deck-${index}`}
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
              <div ref={deckLaunchRef} className={styles.deckLaunchAnchor} aria-hidden="true" />

              {isCollectPhase && (
                <div ref={centerDeckRef} className={styles.collectDeckArea} aria-hidden="true">
                  <div className={styles.deck}>
                    {Array.from({ length: Math.max(totalCards - collectedCount, 0) }).map((_, index) => (
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
              )}

              {(collectedCount > 0 || isDealPhase) && (
                <div className={`${styles.deck} ${styles.deckFloating}`} aria-hidden="true">
                  {Array.from({
                    length: isDealPhase ? remainingDeckCount : collectedCount,
                  }).map((_, index, items) => (
                    <div
                      key={`floating-${index}`}
                      className={`${styles.deckCard} ${styles.cornerDeckCard}`}
                      style={getCornerDeckCardStyle(index, items.length)}
                    >
                      <CardBack branded />
                    </div>
                  ))}
                </div>
              )}

              {isCollectPhase && collectOffset && (
                <div
                  ref={collectingCardRef}
                  className={styles.collectingCard}
                  style={
                    {
                      '--collect-x': `${collectOffset.x}px`,
                      '--collect-y': `${collectOffset.y}px`,
                    } as CSSProperties
                  }
                >
                  <div ref={collectingInnerRef} className={styles.orderCardInner}>
                    <div className={styles.orderCardBack}>
                      <CardBack branded />
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.orderList}>
                {order.map((player, index) => {
                  const dealOffset = dealOffsets[index]
                  const cardStyle = {
                    '--card-index': index,
                    '--deal-x': `${dealOffset?.x ?? 0}px`,
                    '--deal-y': `${dealOffset?.y ?? 0}px`,
                  } as CSSProperties

                  return (
                    <div
                      key={`${player.name}-${index}`}
                      ref={(node) => {
                        slotRefs.current[index] = node
                      }}
                      className={styles.orderSlot}
                    >
                      <div
                        className={
                          index < settledCount
                            ? index === currentOrderIdx
                              ? styles.orderCardSettledActive
                              : styles.orderCardSettled
                            : styles.orderCardPending
                        }
                        style={cardStyle}
                      >
                        <div className={styles.orderCardInner}>
                          <div className={styles.orderCardBack}>
                            <CardBack branded />
                          </div>
                          <div className={styles.orderCardFront}>
                            <span className={styles.orderIndex}>{index + 1}</span>
                            <span className={styles.orderAvatar}>{player.avatar}</span>
                            <div className={styles.orderFrontMeta}>
                              <span className={styles.orderLabel}>Gracz</span>
                              <span className={styles.orderName}>{player.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {index >= settledCount && index < revealedCount && (
                        <div
                          ref={(node) => {
                            dealingCardRefs.current[index] = node
                          }}
                          className={
                            index === currentOrderIdx ? styles.dealingCardActive : styles.dealingCard
                          }
                          style={cardStyle}
                        >
                          <div
                            ref={(node) => {
                              dealingInnerRefs.current[index] = node
                            }}
                            className={styles.orderCardInner}
                          >
                            <div className={styles.orderCardBack}>
                              <CardBack branded />
                            </div>
                            <div className={styles.orderCardFront}>
                              <span className={styles.orderIndex}>{index + 1}</span>
                              <span className={styles.orderAvatar}>{player.avatar}</span>
                              <div className={styles.orderFrontMeta}>
                                <span className={styles.orderLabel}>Gracz</span>
                                <span className={styles.orderName}>{player.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
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

function getCenterDeckCardStyle(index: number) {
  return {
    '--stack-x': `${index * 0.7}px`,
    '--stack-y': `${index * 0.9}px`,
    '--stack-rotate': `${index * 0.4}deg`,
    '--stack-z': index + 1,
  } as CSSProperties
}

function getCornerDeckCardStyle(index: number, total: number) {
  const center = (total - 1) / 2
  const distanceFromCenter = index - center
  const spread = total <= 4 ? 22 : total <= 8 ? 16 : 10
  const lift = total <= 4 ? 18 : total <= 8 ? 12 : 8
  const curve = total <= 4 ? 20 : total <= 8 ? 14 : 8

  return {
    '--corner-fan-x': `${distanceFromCenter * spread}px`,
    '--corner-fan-y': `${Math.abs(distanceFromCenter) * lift + distanceFromCenter * distanceFromCenter * curve}px`,
    '--corner-fan-rotate': `${distanceFromCenter * (total <= 6 ? 5.2 : total <= 10 ? 4 : 3)}deg`,
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

import { useLayoutEffect, useRef } from 'react'
import { AvatarAsset } from '@party/ui'
import { ChevronLeft } from 'lucide-react'
import { useCharadesReducedMotion } from '../../shared/charades-motion'
import styles from '../PlayBoard.module.css'
import { PresenterCard } from '../PlayBoardCards'
import { animatePhaseEnter, type PrepareViewProps } from './shared'

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

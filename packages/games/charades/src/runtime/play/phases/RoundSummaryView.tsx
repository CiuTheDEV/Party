import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AvatarAsset } from '@party/ui'
import { formatGuessTime } from '../../../shared/guess-time'
import { useCharadesReducedMotion } from '../../shared/charades-motion'
import styles from '../PlayBoard.module.css'
import type { RoundSummaryViewProps } from './shared'

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

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AvatarAsset } from '@party/ui'
import { formatGuessTime } from '../../../shared/guess-time'
import { useCharadesReducedMotion } from '../../shared/charades-motion'
import styles from '../PlayBoard.module.css'
import type { RoundSummaryViewProps } from './shared'

function getRoundGuessTime(player: RoundSummaryViewProps['rankedPlayers'][number], currentRound: number) {
  return player.lastScoredRound === currentRound ? player.lastCorrectGuessSeconds ?? null : null
}

function formatRoundGuessTimeBadge(seconds: number) {
  return `Odgadnięto w ${formatGuessTime(seconds)}`
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
  const podiumGroups = podiumPlayers.reduce<Array<{ rank: number; players: typeof podiumPlayers }>>((groups, player) => {
    const existingGroup = groups.find((group) => group.rank === player.rank)

    if (existingGroup) {
      existingGroup.players.push(player)
      return groups
    }

    groups.push({
      rank: player.rank,
      players: [player],
    })

    return groups
  }, [])
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

          {podiumGroups.length > 0 ? (
            <div className={styles.summaryTopRanking}>
              {podiumGroups.map((group) => {
                const isTie = group.players.length > 1

                return (
                  <div
                    key={`summary-rank-${group.rank}`}
                    className={styles.summaryTopGroup}
                    data-rank={group.rank}
                    data-layout={isTie ? 'multi' : 'single'}
                  >
                    <div className={styles.summaryTopHeader}>
                      <div className={styles.summaryTopBadge}>
                        <span className={styles.summaryTopBadgeLabel}>{isTie ? 'Remis' : 'Top'}</span>
                        <span className={styles.summaryTopBadgeRank}>#{group.rank}</span>
                      </div>
                      {isTie ? (
                        <span className={styles.summaryTopCountBadge}>
                          {group.players.length} osoby
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={styles.summaryTopPlayers}
                      data-layout={isTie ? 'multi' : 'single'}
                      data-count={group.players.length}
                    >
                      {group.players.map((player) => {
                        const roundGuessTime = getRoundGuessTime(player, currentRound)

                        return (
                          <article
                            key={player.name}
                            className={styles.summaryTopPlayerCard}
                            data-layout={isTie ? 'multi' : 'single'}
                          >
                            <AvatarAsset avatar={player.avatar} variant="animated" className={styles.summaryTopAvatar} />
                            <span className={styles.summaryTopName} data-gender={player.gender}>
                              {player.name}
                            </span>
                            <div className={styles.summaryScoreStack}>
                              <span className={styles.summaryTopScore}>{player.score ?? 0}</span>
                              {roundGuessTime ? (
                                <span className={styles.summaryTimeBadge}>
                                  {formatRoundGuessTimeBadge(roundGuessTime)}
                                </span>
                              ) : null}
                            </div>
                          </article>
                        )
                      })}
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
                        <span className={styles.summaryTimeBadge}>
                          {formatRoundGuessTimeBadge(player.lastCorrectGuessSeconds)}
                        </span>
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

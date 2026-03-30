'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AvatarAsset } from '../avatars/AvatarAsset'
import styles from './ResultsGroups.module.css'
import type { CharadesResultPlayer } from './types'

export type PlacementGroup = {
  rank: number
  score: number
  players: CharadesResultPlayer[]
}

type Props = {
  groups: PlacementGroup[]
  sortedPlayers: CharadesResultPlayer[]
  compact: boolean
  showGroupCards?: boolean
  forceTable?: boolean
  rankGroups?: PlacementGroup[]
}

export function ResultsGroups({
  groups,
  sortedPlayers,
  compact,
  showGroupCards = true,
  forceTable = false,
  rankGroups = groups,
}: Props) {
  const shouldShowTable = forceTable || sortedPlayers.length > 4
  const [isTableOpen, setIsTableOpen] = useState(false)
  const [tableHeight, setTableHeight] = useState(0)
  const tableSectionRef = useRef<HTMLDivElement | null>(null)
  const tableContentRef = useRef<HTMLDivElement | null>(null)
  const tableEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!shouldShowTable) {
      return
    }

    const syncHeight = () => {
      setTableHeight(tableContentRef.current?.scrollHeight ?? 0)
    }

    syncHeight()
    window.addEventListener('resize', syncHeight)

    return () => {
      window.removeEventListener('resize', syncHeight)
    }
  }, [shouldShowTable, sortedPlayers])

  useEffect(() => {
    if (!isTableOpen) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      tableEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 260)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isTableOpen])

  const handleToggleTable = useCallback(() => {
    setTableHeight(tableContentRef.current?.scrollHeight ?? 0)
    setIsTableOpen((current) => !current)
  }, [])

  return (
    <>
      {showGroupCards && groups.length > 0 ? (
        <div className={compact ? styles.compactGroups : styles.groups}>
          {groups.map((group) => (
            <section
              key={`${group.rank}-${group.score}`}
              className={compact ? styles.compactGroupCard : styles.groupCard}
              data-rank={group.rank}
            >
              <div className={styles.groupHeader}>
                <div className={styles.groupLead}>
                  <span className={styles.groupRankBadge}>{group.rank}</span>
                  <div className={styles.groupTitleBlock}>
                    <p className={styles.groupPlace}>{formatPlaceLabel(group.rank)}</p>
                    <div className={styles.groupMetaRow}>
                      {group.players.length > 1 ? (
                        <span className={styles.groupTieBadge}>Ex aequo</span>
                      ) : null}
                      <span className={styles.groupCount}>
                        {group.players.length === 1 ? '1 osoba' : `${group.players.length} osoby`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.groupScoreCard}>
                  <span className={styles.groupScoreValue}>{group.score}</span>
                  <span className={styles.groupScoreLabel}>pkt</span>
                </div>
              </div>

              <div className={styles.groupPlayers}>
                {group.players.map((player) => (
                  <article key={player.name} className={styles.playerChip} data-rank={group.rank}>
                    <AvatarAsset avatar={player.avatar} className={styles.playerAvatar} />
                    <span className={styles.playerName}>{player.name}</span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {shouldShowTable ? (
        <section
          ref={tableSectionRef}
          className={styles.tableDetails}
          data-open={isTableOpen ? 'true' : 'false'}
        >
          <button
            type="button"
            className={styles.tableSummary}
            aria-expanded={isTableOpen}
            onClick={handleToggleTable}
          >
            <span className={styles.tableSummaryText}>
              <span className={styles.tableSummaryEyebrow}>Ranking</span>
              <span className={styles.tableSummaryTitle}>Pełna tabela wyników</span>
            </span>
            <span className={styles.tableSummaryActions}>
              <span className={styles.tableSummaryCount}>{sortedPlayers.length} graczy</span>
              <span className={styles.tableSummaryArrow} aria-hidden="true">
                ▾
              </span>
            </span>
          </button>

          <div
            className={styles.tableReveal}
            aria-hidden={!isTableOpen}
            style={{ maxHeight: isTableOpen ? `${tableHeight}px` : '0px' }}
          >
            <div ref={tableContentRef} className={styles.tableWrap}>
              <div className={styles.tableHeader}>
                <span>Miejsce</span>
                <span>Gracz</span>
                <span>Punkty</span>
              </div>
              <div className={styles.tableBody}>
                {sortedPlayers.map((player) => (
                  <article key={player.name} className={styles.tableRow}>
                    <span className={styles.tablePlace}>{findRankForPlayer(rankGroups, player.name)}.</span>
                    <span className={styles.tablePlayer}>
                      <AvatarAsset avatar={player.avatar} className={styles.tableAvatar} />
                      <span className={styles.tableName}>{player.name}</span>
                    </span>
                    <span className={styles.tableScore}>{player.score} pkt</span>
                  </article>
                ))}
              </div>
              <div ref={tableEndRef} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

function formatPlaceLabel(rank: number) {
  return `${rank}. miejsce`
}

function findRankForPlayer(groups: PlacementGroup[], playerName: string) {
  const group = groups.find((item) => item.players.some((player) => player.name === playerName))
  return group?.rank ?? 0
}

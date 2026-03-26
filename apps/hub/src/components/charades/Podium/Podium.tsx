import type { Player } from '../../../hooks/charades/useGameState'
import styles from './Podium.module.css'

type Props = {
  players: Player[]
}

type PlacementGroup = {
  rank: number
  score: number
  players: Player[]
}

export function Podium({ players }: Props) {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }

    return a.name.localeCompare(b.name, 'pl')
  })

  const groups = buildPlacementGroups(sorted)
  const leaders = groups[0]?.players ?? []
  const showClassicPodium =
    groups.length >= 3 &&
    groups[0].players.length === 1 &&
    groups[1].players.length === 1 &&
    groups[2].players.length === 1
  const podiumPlayers = showClassicPodium
    ? [groups[1].players[0], groups[0].players[0], groups[2].players[0]]
    : []
  const detailGroups = showClassicPodium ? groups.slice(3) : groups
  const shouldShowTable = sorted.length > 4
  const useCompactGroups = shouldShowTable

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>{leaders.length > 1 ? 'Remis na prowadzeniu' : 'Zwyciezca'}</p>
        <div className={styles.heroNames}>
          {leaders.map((player) => (
            <span key={player.name} className={styles.heroNameChip}>
              <span className={styles.heroAvatar}>{player.avatar}</span>
              <span>{player.name}</span>
            </span>
          ))}
        </div>
        <p className={styles.heroScore}>
          {leaders[0]?.score ?? 0} pkt
          {leaders.length > 1 ? ' kazda osoba' : ''}
        </p>
      </section>

      {showClassicPodium ? (
        <section className={styles.podiumSection}>
          <div className={styles.podium}>
            <PodiumSlot player={podiumPlayers[0]} place={2} />
            <PodiumSlot player={podiumPlayers[1]} place={1} />
            <PodiumSlot player={podiumPlayers[2]} place={3} />
          </div>
        </section>
      ) : null}

      {!showClassicPodium && detailGroups.length > 0 ? (
        <div className={useCompactGroups ? styles.compactGroups : styles.groups}>
          {detailGroups.map((group) => (
            <section
              key={`${group.rank}-${group.score}`}
              className={useCompactGroups ? styles.compactGroupCard : styles.groupCard}
            >
              <div className={styles.groupHeader}>
                <div className={styles.groupRankBlock}>
                  <span className={styles.groupRankBadge}>{group.rank}</span>
                  <div className={styles.groupRankText}>
                    <p className={styles.groupPlace}>{formatPlaceLabel(group.rank, group.players.length)}</p>
                    <p className={styles.groupScore}>{group.score} pkt</p>
                  </div>
                </div>
                <span className={styles.groupCount}>
                  {group.players.length === 1 ? '1 osoba' : `${group.players.length} osoby`}
                </span>
              </div>
              <div className={styles.groupPlayers}>
                {group.players.map((player) => (
                  <article key={player.name} className={styles.playerChip}>
                    <span className={styles.playerAvatar}>{player.avatar}</span>
                    <span className={styles.playerName}>{player.name}</span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {shouldShowTable ? (
        <details className={styles.tableDetails}>
          <summary className={styles.tableSummary}>
            <span className={styles.tableSummaryText}>
              <span className={styles.tableSummaryEyebrow}>Ranking</span>
              <span className={styles.tableSummaryTitle}>Pelna tabela wynikow</span>
            </span>
            <span className={styles.tableSummaryCount}>{sorted.length} graczy</span>
          </summary>
          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <span>Miejsce</span>
              <span>Gracz</span>
              <span>Punkty</span>
            </div>
            <div className={styles.tableBody}>
              {sorted.map((player) => (
                <article key={player.name} className={styles.tableRow}>
                  <span className={styles.tablePlace}>{findRankForPlayer(groups, player.name)}.</span>
                  <span className={styles.tablePlayer}>
                    <span className={styles.tableAvatar}>{player.avatar}</span>
                    <span className={styles.tableName}>{player.name}</span>
                  </span>
                  <span className={styles.tableScore}>{player.score} pkt</span>
                </article>
              ))}
            </div>
          </div>
        </details>
      ) : null}
    </div>
  )
}

function PodiumSlot({ player, place }: { player: Player; place: 1 | 2 | 3 }) {
  const heights = { 1: 152, 2: 116, 3: 92 }

  return (
    <div className={`${styles.slot} ${styles[`place${place}`]}`}>
      <div className={styles.slotAvatar}>{player.avatar}</div>
      <div className={styles.slotName}>{player.name}</div>
      <div className={styles.slotScore}>{player.score} pkt</div>
      <div className={styles.bar} style={{ height: heights[place] }}>
        {place}
      </div>
    </div>
  )
}

function buildPlacementGroups(players: Player[]): PlacementGroup[] {
  const groups: PlacementGroup[] = []

  for (const player of players) {
    const previousGroup = groups.at(-1)

    if (!previousGroup || previousGroup.score !== player.score) {
      groups.push({
        rank: groups.length + 1,
        score: player.score,
        players: [player],
      })
      continue
    }

    previousGroup.players.push(player)
  }

  return groups
}

function formatPlaceLabel(rank: number, groupSize: number) {
  return `${rank}. miejsce${groupSize > 1 ? ' ex aequo' : ''}`
}

function findRankForPlayer(groups: PlacementGroup[], playerName: string) {
  const group = groups.find((item) => item.players.some((player) => player.name === playerName))
  return group?.rank ?? 0
}

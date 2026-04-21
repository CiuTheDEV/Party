import { AvatarAsset } from '@party/ui'
import styles from './Podium.module.css'
import { ResultsGroups, type PlacementGroup } from './ResultsGroups'
import type { CharadesResultPlayer } from './types'

type Props = {
  players: CharadesResultPlayer[]
}

export function Podium({ players }: Props) {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }

    if ((a.totalGuessTimeSeconds ?? 0) !== (b.totalGuessTimeSeconds ?? 0)) {
      return (a.totalGuessTimeSeconds ?? 0) - (b.totalGuessTimeSeconds ?? 0)
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
  const showTwoPlayerPodium =
    !showClassicPodium &&
    groups.length >= 2 &&
    groups[0].players.length === 1 &&
    groups[1].players.length === 1
  const podiumPlayers = showClassicPodium
    ? [groups[1].players[0], groups[0].players[0], groups[2].players[0]]
    : showTwoPlayerPodium
      ? [groups[1].players[0], groups[0].players[0]]
      : []
  const detailGroups = showClassicPodium ? groups.slice(3) : showTwoPlayerPodium ? groups.slice(2) : groups.slice(1)

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>
          {leaders.length > 1 ? 'Remis na prowadzeniu' : 'Zwycięzca'}
        </p>
        <div className={styles.heroNames}>
          {leaders.map((player) => (
            <span key={player.name} className={styles.heroNameChip}>
              <AvatarAsset avatar={player.avatar} variant="animated" className={styles.heroAvatar} />
              <span>{player.name}</span>
            </span>
          ))}
        </div>
        <p className={styles.heroScore}>
          {leaders[0]?.score ?? 0} pkt{leaders.length > 1 ? ' każda osoba' : ''}
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
      ) : showTwoPlayerPodium ? (
        <section className={styles.podiumSection}>
          <div className={`${styles.podium} ${styles.podiumTwoPlayers}`}>
            <PodiumSlot player={podiumPlayers[0]} place={2} />
            <PodiumSlot player={podiumPlayers[1]} place={1} />
          </div>
        </section>
      ) : null}

      {showClassicPodium || showTwoPlayerPodium ? (
        <ResultsGroups
          groups={[]}
          sortedPlayers={sorted}
          compact={sorted.length > 4}
          showGroupCards={false}
          forceTable={sorted.length > 3}
          rankGroups={groups}
        />
      ) : detailGroups.length > 0 ? (
        <ResultsGroups groups={detailGroups} sortedPlayers={sorted} compact={sorted.length > 4} />
      ) : null}
    </div>
  )
}

function PodiumSlot({ player, place }: { player: CharadesResultPlayer; place: 1 | 2 | 3 }) {
  const heights = { 1: 152, 2: 116, 3: 92 }

  return (
    <div className={`${styles.slot} ${styles[`place${place}`]}`}>
      <AvatarAsset avatar={player.avatar} variant="animated" className={styles.slotAvatar} />
      <div className={styles.slotName}>{player.name}</div>
      <div className={styles.slotScore}>{player.score} pkt</div>
      <div className={styles.bar} style={{ height: heights[place] }}>
        {place}
      </div>
    </div>
  )
}

function buildPlacementGroups(players: CharadesResultPlayer[]): PlacementGroup[] {
  const groups: PlacementGroup[] = []

  for (const player of players) {
    const previousGroup = groups[groups.length - 1]

    if (
      !previousGroup ||
      previousGroup.score !== player.score ||
      (previousGroup.players[0]?.totalGuessTimeSeconds ?? 0) !== (player.totalGuessTimeSeconds ?? 0)
    ) {
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

import type { Player } from '../../../hooks/charades/useGameState'
import styles from './Podium.module.css'

type Props = {
  players: Player[]
}

export function Podium({ players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <div className={styles.wrapper}>
      <div className={styles.podium}>
        {top3[1] && <PodiumSlot player={top3[1]} place={2} />}
        {top3[0] && <PodiumSlot player={top3[0]} place={1} />}
        {top3[2] && <PodiumSlot player={top3[2]} place={3} />}
      </div>
      {rest.length > 0 && (
        <ul className={styles.rest}>
          {rest.map((p, i) => (
            <li key={p.name} className={styles.restItem}>
              <span className={styles.place}>{i + 4}.</span>
              <span className={styles.avatar}>{p.avatar}</span>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.score}>{p.score} pkt</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PodiumSlot({ player, place }: { player: Player; place: number }) {
  const heights = { 1: 120, 2: 90, 3: 70 }
  return (
    <div className={`${styles.slot} ${styles[`place${place}`]}`}>
      <div className={styles.slotAvatar}>{player.avatar}</div>
      <div className={styles.slotName}>{player.name}</div>
      <div className={styles.slotScore}>{player.score} pkt</div>
      <div className={styles.bar} style={{ height: heights[place as 1 | 2 | 3] }}>
        {place}
      </div>
    </div>
  )
}

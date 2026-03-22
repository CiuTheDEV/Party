import type { Player } from '../../../hooks/charades/useGameState'
import styles from './PlayerList.module.css'

type Props = {
  players: Omit<Player, 'score'>[]
  onRemove: (index: number) => void
}

export function PlayerList({ players, onRemove }: Props) {
  if (players.length === 0) return null

  return (
    <ul className={styles.list}>
      {players.map((p, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.avatar}>{p.avatar}</span>
          <span className={styles.name}>{p.name}</span>
          {p.gender !== 'none' && <span className={styles.gender}>{p.gender}</span>}
          <button className={styles.remove} onClick={() => onRemove(i)} aria-label="Usuń gracza">
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}

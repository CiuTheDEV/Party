import type { Player } from '../../../hooks/charades/useGameState'
import styles from './PlayerGrid.module.css'

type Props = {
  players: Omit<Player, 'score'>[]
  onRemove: (index: number) => void
  onAdd: () => void
  max?: number
}

export function PlayerGrid({ players, onRemove, onAdd, max = 12 }: Props) {
  return (
    <div className={styles.grid}>
      {players.map((p, i) => (
        <div key={i} className={styles.card}>
          <button
            className={styles.removeBtn}
            onClick={() => onRemove(i)}
            aria-label={`Usuń ${p.name}`}
          >
            ✕
          </button>
          <span className={styles.avatar}>{p.avatar}</span>
          <span className={styles.namePill} data-gender={p.gender}>{p.name}</span>
        </div>
      ))}
      {players.length < max && (
        <button className={styles.addCard} onClick={onAdd} aria-label="Dodaj gracza">
          <span className={styles.addIcon}>+</span>
          <span className={styles.addLabel}>Dodaj</span>
        </button>
      )}
    </div>
  )
}

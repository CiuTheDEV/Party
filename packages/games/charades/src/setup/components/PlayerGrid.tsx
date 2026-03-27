import type { CharadesPlayerDraft } from '../state'
import styles from './PlayerGrid.module.css'

type Props = {
  players: CharadesPlayerDraft[]
  onRemove: (index: number) => void
  onAdd: () => void
  max?: number
}

export function PlayerGrid({ players, onRemove, onAdd, max = 12 }: Props) {
  return (
    <div className={styles.grid}>
      {players.map((player, index) => (
        <div key={`${player.name}-${index}`} className={styles.card}>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(index)}
            aria-label={`Usun ${player.name}`}
          >
            &times;
          </button>
          <span className={styles.avatar}>{player.avatar}</span>
          <span className={styles.namePill} data-gender={player.gender}>{player.name}</span>
        </div>
      ))}
      {players.length < max ? (
        <button type="button" className={styles.addCard} onClick={onAdd} aria-label="Dodaj gracza">
          <span className={styles.addIcon}>+</span>
          <span className={styles.addLabel}>Dodaj</span>
        </button>
      ) : null}
    </div>
  )
}

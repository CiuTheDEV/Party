import { AvatarAsset } from '@party/ui'
import { Plus, X } from 'lucide-react'
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
            <X size={12} />
          </button>
          <AvatarAsset avatar={player.avatar} className={styles.avatar} />
          <span className={styles.namePill} data-gender={player.gender}>{player.name}</span>
        </div>
      ))}
      {players.length < max ? (
        <button type="button" className={styles.addCard} onClick={onAdd} aria-label="Dodaj gracza">
          <span className={styles.addIcon}><Plus size={24} /></span>
          <span className={styles.addLabel}>Dodaj</span>
        </button>
      ) : null}
    </div>
  )
}

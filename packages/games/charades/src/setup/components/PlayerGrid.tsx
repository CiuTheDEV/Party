import { AvatarAsset } from '@party/ui'
import { Pencil, Plus, X } from 'lucide-react'
import type { CharadesPlayerDraft } from '../state'
import { CHARADES_MAX_PLAYERS } from '../state'
import styles from './PlayerGrid.module.css'

type Props = {
  players: CharadesPlayerDraft[]
  onRemove: (index: number) => void
  onEdit: (index: number) => void
  onAdd: () => void
  max?: number
}

export function PlayerGrid({ players, onRemove, onEdit, onAdd, max = CHARADES_MAX_PLAYERS }: Props) {
  return (
    <div className={styles.grid}>
      {players.map((player, index) => (
        <div key={`${player.name}-${index}`} className={styles.card}>
          <div className={styles.actionStack}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => onEdit(index)}
              aria-label={`Edytuj ${player.name}`}
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.removeBtn}`}
              onClick={() => onRemove(index)}
              aria-label={`Usun ${player.name}`}
            >
              <X size={12} />
            </button>
          </div>
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

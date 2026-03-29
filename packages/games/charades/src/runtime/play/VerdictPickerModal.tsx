import styles from './HostGameScreen.module.css'
import type { PlayerSummary } from './playboard-types'

type GuessablePlayer = PlayerSummary & {
  index: number
}

type Props = {
  players: GuessablePlayer[]
  selectedPlayerIdx: number | null
  onSelectPlayer: (playerIdx: number) => void
  onCancel: () => void
  onConfirm: () => void
}

export function VerdictPickerModal({
  players,
  selectedPlayerIdx,
  onSelectPlayer,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Wybierz gracza">
      <div className={styles.modalCard}>
        <span className={styles.modalEyebrow}>Zgadnięto</span>
        <h2 className={styles.modalTitle}>Który gracz odgadł hasło?</h2>
        <div className={styles.modalList}>
          {players.map((player) => {
            const isSelected = selectedPlayerIdx === player.index
            return (
              <button
                key={`${player.name}-${player.index}`}
                type="button"
                className={isSelected ? styles.playerOptionSelected : styles.playerOption}
                onClick={() => onSelectPlayer(player.index)}
              >
                <span className={styles.playerAvatar}>{player.avatar}</span>
                <span className={styles.playerName} data-gender={player.gender}>
                  {player.name}
                </span>
              </button>
            )
          })}
        </div>
        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Wróć
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            disabled={selectedPlayerIdx === null}
            onClick={onConfirm}
          >
            Przyznaj punkt
          </button>
        </div>
      </div>
    </div>
  )
}

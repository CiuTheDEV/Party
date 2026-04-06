import { AvatarAsset } from '@party/ui'
import { ActionHint } from './ActionHint'
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
  actionHints?: {
    confirm?: string | null
    cancel?: string | null
    previous?: string | null
    next?: string | null
  }
}

export function VerdictPickerModal({
  players,
  selectedPlayerIdx,
  onSelectPlayer,
  onCancel,
  onConfirm,
  actionHints,
}: Props) {
  const density =
    players.length === 12
      ? 'grid-12'
      : players.length >= 10
        ? 'grid-10'
        : players.length === 9
          ? 'grid-9'
          : 'default'

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Wybierz gracza">
      <div className={styles.modalCard}>
        <span className={styles.modalEyebrow}>Zgadnięto</span>
        <h2 className={styles.modalTitle}>Który gracz odgadł hasło?</h2>
        <div className={styles.modalList} data-density={density}>
          {players.map((player) => {
            const isSelected = selectedPlayerIdx === player.index
            return (
              <button
                key={`${player.name}-${player.index}`}
                type="button"
                className={isSelected ? styles.playerOptionSelected : styles.playerOption}
                onClick={() => onSelectPlayer(player.index)}
              >
                <AvatarAsset avatar={player.avatar} className={styles.playerAvatar} />
                <span className={styles.playerName} data-gender={player.gender}>
                  {player.name}
                </span>
              </button>
            )
          })}
        </div>
        <div className={styles.modalHintRow}>
          <span className={styles.modalHintText}>
            <ActionHint label={actionHints?.previous} muted /> / <ActionHint label={actionHints?.next} muted /> wybór gracza
          </span>
        </div>
        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            <span>Wróć</span>
            <ActionHint label={actionHints?.cancel} muted />
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            disabled={selectedPlayerIdx === null}
            onClick={onConfirm}
          >
            <span>Przyznaj punkt</span>
            <ActionHint label={actionHints?.confirm} />
          </button>
        </div>
      </div>
    </div>
  )
}

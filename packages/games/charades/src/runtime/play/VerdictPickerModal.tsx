import { AvatarAsset } from '@party/ui'
import { ActionHint } from './ActionHint'
import styles from './HostGameScreen.module.css'
import type { PlayerSummary } from './playboard-types'
import { getVerdictGridDensity } from './verdict-grid'

type GuessablePlayer = PlayerSummary & {
  index: number
}

type Props = {
  players: GuessablePlayer[]
  selectedPlayerIdx: number | null
  selectionStage: 'players' | 'actions'
  actionTarget: 'cancel' | 'confirm'
  isFocusVisible?: boolean
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
  selectionStage,
  actionTarget,
  isFocusVisible = false,
  onSelectPlayer,
  onCancel,
  onConfirm,
  actionHints,
}: Props) {
  const density = getVerdictGridDensity(players.length)

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Wybierz gracza">
      <div className={styles.modalCard}>
        <span className={styles.modalEyebrow}>Zgadnięto</span>
        <h2 className={styles.modalTitle}>Który gracz odgadł hasło?</h2>
        <div className={styles.modalList} data-density={density}>
          {players.map((player) => {
            const isSelected = selectedPlayerIdx === player.index
            const isFocusedPlayer = isSelected && isFocusVisible && selectionStage === 'players'

            return (
              <button
                key={`${player.name}-${player.index}`}
                type="button"
                className={[
                  styles.playerOption,
                  isSelected ? styles.playerOptionSelected : '',
                  isFocusedPlayer ? styles.controlFocused : '',
                ].filter(Boolean).join(' ')}
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
          {selectionStage === 'players' ? (
            <span className={styles.modalHintText}>
              <ActionHint label={actionHints?.previous} muted /> / <ActionHint label={actionHints?.next} muted /> wybór gracza
            </span>
          ) : (
            <span className={styles.modalHintText}>
              <ActionHint label={actionHints?.cancel} muted /> wraca do wyboru gracza
            </span>
          )}
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={[
              styles.cancelButton,
              isFocusVisible && selectionStage === 'actions' && actionTarget === 'cancel' ? styles.controlFocused : '',
            ].filter(Boolean).join(' ')}
            onClick={onCancel}
          >
            <span>Wróć</span>
            <ActionHint label={isFocusVisible && selectionStage === 'actions' && actionTarget === 'cancel' ? actionHints?.confirm : null} muted />
          </button>
          <button
            type="button"
            className={[
              styles.confirmButton,
              isFocusVisible && selectionStage === 'actions' && actionTarget === 'confirm' ? styles.controlFocused : '',
            ].filter(Boolean).join(' ')}
            disabled={selectedPlayerIdx === null}
            onClick={onConfirm}
          >
            <span>Przyznaj punkt</span>
            <ActionHint label={isFocusVisible && selectionStage === 'actions' && actionTarget === 'confirm' ? actionHints?.confirm : null} />
          </button>
        </div>
      </div>
    </div>
  )
}

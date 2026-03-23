import styles from './PlayBottomBar.module.css'

type Phase =
  | 'round-order'
  | 'prepare'
  | 'waiting-ready'
  | 'timer-running'
  | 'verdict'

type PlayBottomBarProps = {
  phase: Phase
  isDeviceConnected: boolean
  onStartRound: () => void
  onSendWord: () => void
  onGiveVerdict: (correct: boolean) => void
}

export function PlayBottomBar({
  phase,
  isDeviceConnected,
  onStartRound,
  onSendWord,
  onGiveVerdict,
}: PlayBottomBarProps) {
  return (
    <footer className={styles.bar}>
      {phase === 'round-order' && (
        <button className={styles.primaryButton} onClick={onStartRound}>
          Zaczynamy rundę
        </button>
      )}

      {phase === 'prepare' && (
        <button
          className={styles.primaryButton}
          disabled={!isDeviceConnected}
          onClick={onSendWord}
        >
          Wyślij hasło na telefon
        </button>
      )}

      {phase === 'waiting-ready' && (
        <p className={styles.infoText}>Czekamy, aż prezenter kliknie „Gotowy” na telefonie.</p>
      )}

      {phase === 'timer-running' && <div className={styles.spacer} aria-hidden="true" />}

      {phase === 'verdict' && (
        <div className={styles.verdictActions}>
          <button className={styles.successButton} onClick={() => onGiveVerdict(true)}>
            Zgadnięto
          </button>
          <button className={styles.dangerButton} onClick={() => onGiveVerdict(false)}>
            Nie zgadnięto
          </button>
        </div>
      )}
    </footer>
  )
}

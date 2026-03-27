import styles from './PlayBottomBar.module.css'

type Phase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

type PlayBottomBarProps = {
  phase: Phase
  isRoomConnected: boolean
  isDeviceConnected: boolean
  isRoundOrderRevealing: boolean
  roundOrderCountdown: number | null
  onStartRound: () => void
  onContinueRoundSummary: () => void
  onExitToMenu: () => void
  onStopRound: () => void
  onCorrectVerdict: () => void
  onIncorrectVerdict: () => void
}

export function PlayBottomBar({
  phase,
  isRoomConnected,
  isDeviceConnected,
  isRoundOrderRevealing,
  roundOrderCountdown,
  onStartRound,
  onContinueRoundSummary,
  onExitToMenu,
  onStopRound,
  onCorrectVerdict,
  onIncorrectVerdict,
}: PlayBottomBarProps) {
  return (
    <footer className={styles.bar}>
      <div className={styles.rail} aria-hidden="true" />

      {!isRoomConnected ? (
        <p className={styles.connectionAlert}>
          Problem z połączeniem z pokojem. Odśwież stronę albo wróć do menu, jeśli stan gry się nie
          odświeża.
        </p>
      ) : null}

      {phase === 'round-order' && !isRoundOrderRevealing && (
        <button className={styles.primaryButton} onClick={onStartRound}>
          Wylosuj kolejność
        </button>
      )}

      {phase === 'round-order' && isRoundOrderRevealing && (
        roundOrderCountdown === null ? (
          <p className={styles.infoTextWithSpinner}>
            <span className={styles.spinner} aria-hidden="true" />
            <span>Losowanie...</span>
          </p>
        ) : (
          <p className={styles.infoText}>
            Przechodzimy dalej za {roundOrderCountdown} s
          </p>
        )
      )}

      {phase === 'prepare' && (
        <p className={styles.infoText}>
          {isDeviceConnected
            ? 'Czekamy, aż prezenter odkryje hasło na telefonie.'
            : 'Połącz telefon prezentera, aby kontynuować.'}
        </p>
      )}

      {phase === 'reveal-buffer' && (
        <p className={styles.infoText}>Prezenter zapoznaje się z hasłem.</p>
      )}

      {phase === 'timer-running' && (
        <div className={styles.timerActions}>
          <button className={styles.stopButton} onClick={onStopRound}>
            STOP
          </button>
        </div>
      )}

      {phase === 'round-summary' && (
        <div className={styles.verdictActions}>
          <button className={styles.stopButton} onClick={onExitToMenu}>
            Powrót do menu
          </button>
          <button className={styles.primaryButton} onClick={onContinueRoundSummary}>
            Następna runda
          </button>
        </div>
      )}

      {phase === 'verdict' && (
        <div className={styles.verdictActions}>
          <button className={styles.successButton} onClick={onCorrectVerdict}>
            Zgadnięto
          </button>
          <button className={styles.dangerButton} onClick={onIncorrectVerdict}>
            Nie zgadnięto
          </button>
        </div>
      )}
    </footer>
  )
}

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

      {phase === 'round-order' && !isRoundOrderRevealing && (
        <button className={styles.primaryButton} onClick={onStartRound}>
          Wylosuj kolejnosc
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
            ? 'Czekamy, az prezenter odkryje haslo na telefonie.'
            : 'Polacz telefon prezentera, aby kontynuowac.'}
        </p>
      )}

      {phase === 'reveal-buffer' && (
        <p className={styles.infoText}>Prezenter zapoznaje sie z haslem.</p>
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
            Powrot do menu
          </button>
          <button className={styles.primaryButton} onClick={onContinueRoundSummary}>
            Nastepna runda
          </button>
        </div>
      )}

      {phase === 'verdict' && (
        <div className={styles.verdictActions}>
          <button className={styles.successButton} onClick={onCorrectVerdict}>
            Zgadnieto
          </button>
          <button className={styles.dangerButton} onClick={onIncorrectVerdict}>
            Nie zgadnieto
          </button>
        </div>
      )}
    </footer>
  )
}

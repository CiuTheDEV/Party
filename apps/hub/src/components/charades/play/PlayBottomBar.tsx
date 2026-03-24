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
  isRoundOrderRevealing: boolean
  roundOrderCountdown: number | null
  onStartRound: () => void
  onSendWord: () => void
  onGiveVerdict: (correct: boolean) => void
}

export function PlayBottomBar({
  phase,
  isDeviceConnected,
  isRoundOrderRevealing,
  roundOrderCountdown,
  onStartRound,
  onSendWord,
  onGiveVerdict,
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
        <button
          className={styles.primaryButton}
          disabled={!isDeviceConnected}
          onClick={onSendWord}
        >
          Wyslij haslo na telefon
        </button>
      )}

      {phase === 'waiting-ready' && (
        <p className={styles.infoText}>Czekamy, az prezenter kliknie "Gotowy" na telefonie.</p>
      )}

      {phase === 'timer-running' && (
        <p className={styles.infoText}>Tura trwa. Werdykt pojawi sie po zakonczeniu czasu.</p>
      )}

      {phase === 'verdict' && (
        <div className={styles.verdictActions}>
          <button className={styles.successButton} onClick={() => onGiveVerdict(true)}>
            Zgadnieto
          </button>
          <button className={styles.dangerButton} onClick={() => onGiveVerdict(false)}>
            Nie zgadnieto
          </button>
        </div>
      )}
    </footer>
  )
}

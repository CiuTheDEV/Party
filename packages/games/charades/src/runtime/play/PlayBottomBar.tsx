import { ActionHint } from './ActionHint'
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
  roomConnectionState: 'connected' | 'reconnecting' | 'error'
  isDeviceConnected: boolean
  isRoundOrderRevealing: boolean
  roundOrderCountdown: number | null
  onStartRound: () => void
  onContinueRoundSummary: () => void
  onExitToMenu: () => void
  onStopRound: () => void
  onCorrectVerdict: () => void
  onIncorrectVerdict: () => void
  verdictFocusedTarget?: 'correct' | 'incorrect'
  isFocusVisible?: boolean
  actionHints?: {
    confirm?: string | null
    menu?: string | null
  }
}

export function PlayBottomBar({
  phase,
  isRoomConnected,
  roomConnectionState,
  isDeviceConnected,
  isRoundOrderRevealing,
  roundOrderCountdown,
  onStartRound,
  onContinueRoundSummary,
  onExitToMenu,
  onStopRound,
  onCorrectVerdict,
  onIncorrectVerdict,
  verdictFocusedTarget = 'correct',
  isFocusVisible = false,
  actionHints,
}: PlayBottomBarProps) {
  return (
    <footer className={styles.bar}>
      <div className={styles.rail} aria-hidden="true" />

      {!isRoomConnected ? (
        <p className={styles.connectionAlert}>
          {roomConnectionState === 'reconnecting'
            ? 'Łączę ponownie z pokojem gry. Tura jest chwilowo wstrzymana.'
            : 'Problem z połączeniem z pokojem. Jeśli stan nie wróci po chwili, wróć do menu i uruchom rozgrywkę ponownie.'}
        </p>
      ) : null}

      {phase === 'round-order' && !isRoundOrderRevealing && (
        <button className={styles.primaryButton} onClick={onStartRound}>
          <span>Wylosuj kolejność</span>
          <ActionHint label={actionHints?.confirm} />
        </button>
      )}

      {phase === 'round-order' && isRoundOrderRevealing &&
        (roundOrderCountdown === null ? (
          <p className={styles.infoTextWithSpinner}>
            <span className={styles.spinner} aria-hidden="true" />
            <span>Losowanie...</span>
          </p>
        ) : (
          <p className={styles.infoText}>Przechodzimy dalej za {roundOrderCountdown} s</p>
        ))}

      {phase === 'prepare' && (
        <p className={styles.infoText}>
          {isDeviceConnected
            ? 'Czekamy, aż prezenter odkryje hasło na telefonie.'
            : 'Połącz telefon prezentera, aby kontynuować.'}
        </p>
      )}

      {phase === 'reveal-buffer' && <p className={styles.infoText}>Prezenter zapoznaje się z hasłem.</p>}

      {phase === 'timer-running' && (
        <div className={styles.timerActions}>
          <button className={styles.stopButton} onClick={onStopRound}>
            <span>STOP</span>
            <ActionHint label={actionHints?.confirm} muted />
          </button>
        </div>
      )}

      {phase === 'round-summary' && (
        <div className={styles.verdictActions}>
          <button className={styles.stopButton} onClick={onExitToMenu}>
            <span>Powrót do menu</span>
            <ActionHint label={actionHints?.menu} muted />
          </button>
          <button className={styles.primaryButton} onClick={onContinueRoundSummary}>
            <span>Następna runda</span>
            <ActionHint label={actionHints?.confirm} />
          </button>
        </div>
      )}

      {phase === 'verdict' && (
        <div className={styles.verdictActions}>
          <button
            className={[
              styles.successButton,
              isFocusVisible && verdictFocusedTarget === 'correct' ? styles.controlFocused : '',
            ].filter(Boolean).join(' ')}
            onClick={onCorrectVerdict}
          >
            <span>Zgadnięto</span>
            <ActionHint label={isFocusVisible && verdictFocusedTarget === 'correct' ? actionHints?.confirm : null} />
          </button>
          <button
            className={[
              styles.dangerButton,
              isFocusVisible && verdictFocusedTarget === 'incorrect' ? styles.controlFocused : '',
            ].filter(Boolean).join(' ')}
            onClick={onIncorrectVerdict}
          >
            <span>Nie zgadnięto</span>
            <ActionHint label={isFocusVisible && verdictFocusedTarget === 'incorrect' ? actionHints?.confirm : null} />
          </button>
        </div>
      )}
    </footer>
  )
}

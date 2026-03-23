import styles from './PlayTopBar.module.css'

type Phase =
  | 'round-order'
  | 'prepare'
  | 'waiting-ready'
  | 'timer-running'
  | 'verdict'

type ActivePlayer = {
  name: string
  avatar: string
}

type PhoneState = 'polaczony' | 'oczekiwanie' | 'rozlaczony'

type PlayTopBarProps = {
  currentRound: number
  totalRounds: number
  currentOrderIdx: number
  orderLength: number
  phase: Phase
  phoneState: PhoneState
  activePlayer: ActivePlayer | undefined
}

const phaseLabels: Record<Phase, string> = {
  'round-order': 'Kolejnosc rundy',
  prepare: 'Przygotowanie',
  'waiting-ready': 'Czekamy na gotowosc',
  'timer-running': 'Trwa tura',
  verdict: 'Werdykt',
}

export function PlayTopBar({
  currentRound,
  totalRounds,
  currentOrderIdx,
  orderLength,
  phase,
  phoneState,
  activePlayer,
}: PlayTopBarProps) {
  const phoneLabel = phoneState === 'oczekiwanie' ? 'Telefon oczekiwanie' : `Telefon ${phoneState}`
  const phoneClassName =
    phoneState === 'rozlaczony' ? styles.deviceDisconnected : styles.deviceConnected

  return (
    <header className={styles.bar}>
      <div className={styles.metaGroup}>
        <span className={styles.gameName}>Kalambury</span>
        <span className={styles.meta}>Runda {currentRound}/{totalRounds}</span>
        <span className={styles.status}>{phaseLabels[phase]}</span>
        <span className={styles.meta}>
          {activePlayer ? `${activePlayer.avatar} ${activePlayer.name}` : `Gracz ${currentOrderIdx + 1}/${orderLength}`}
        </span>
      </div>

      <div className={phoneClassName}>
        <span className={styles.deviceIcon}>Telefon</span>
        <span>{phoneLabel}</span>
      </div>
    </header>
  )
}

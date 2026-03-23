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

type PlayTopBarProps = {
  currentRound: number
  totalRounds: number
  currentOrderIdx: number
  orderLength: number
  phase: Phase
  isDeviceConnected: boolean
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
  isDeviceConnected,
  activePlayer,
}: PlayTopBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.metaGroup}>
        <span className={styles.gameName}>Kalambury</span>
        <span className={styles.meta}>Runda {currentRound}/{totalRounds}</span>
        <span className={styles.status}>{phaseLabels[phase]}</span>
        <span className={styles.meta}>
          {activePlayer ? `${activePlayer.avatar} ${activePlayer.name}` : `Gracz ${currentOrderIdx + 1}/${orderLength}`}
        </span>
        <span className={styles.meta}>Gracz {currentOrderIdx + 1}/{orderLength}</span>
      </div>

      <div className={isDeviceConnected ? styles.deviceConnected : styles.deviceDisconnected}>
        <span className={styles.deviceIcon}>{isDeviceConnected ? 'Telefon OK' : 'Brak telefonu'}</span>
        <span>Telefon {isDeviceConnected ? 'polaczony' : 'rozlaczony'}</span>
      </div>
    </header>
  )
}

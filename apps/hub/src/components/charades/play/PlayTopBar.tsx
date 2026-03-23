import styles from './PlayTopBar.module.css'

type Phase =
  | 'round-order'
  | 'prepare'
  | 'waiting-ready'
  | 'timer-running'
  | 'verdict'

type ScorePlayer = {
  name: string
  avatar: string
  score: number
}

type PlayTopBarProps = {
  currentRound: number
  totalRounds: number
  currentOrderIdx: number
  orderLength: number
  phase: Phase
  isDeviceConnected: boolean
  players: ScorePlayer[]
}

const phaseLabels: Record<Phase, string> = {
  'round-order': 'Kolejność rundy',
  prepare: 'Przygotowanie',
  'waiting-ready': 'Czekamy na prezentera',
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
  players,
}: PlayTopBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.leftSide}>
        <div className={styles.metaGroup}>
          <span className={styles.gameName}>Kalambury</span>
          <span className={styles.meta}>Runda {currentRound}/{totalRounds}</span>
          <span className={styles.meta}>Gracz {currentOrderIdx + 1}/{orderLength}</span>
          <span className={styles.status}>{phaseLabels[phase]}</span>
        </div>

        <div className={styles.scoreboard} aria-label="Wyniki graczy">
          {players.map((player) => (
            <span key={player.name} className={styles.scoreChip}>
              <span className={styles.scoreAvatar}>{player.avatar}</span>
              <span className={styles.scoreValue}>{player.score}</span>
            </span>
          ))}
        </div>
      </div>

      <div className={isDeviceConnected ? styles.deviceConnected : styles.deviceDisconnected}>
        <span className={styles.deviceIcon}>{isDeviceConnected ? '📱' : '📵'}</span>
        <span>Telefon {isDeviceConnected ? 'połączony' : 'rozłączony'}</span>
      </div>
    </header>
  )
}

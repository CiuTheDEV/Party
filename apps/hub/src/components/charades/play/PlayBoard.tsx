import styles from './PlayBoard.module.css'

type PlayerSummary = {
  name: string
  avatar: string
}

type Phase =
  | 'round-order'
  | 'prepare'
  | 'waiting-ready'
  | 'timer-running'
  | 'verdict'

type PlayBoardProps = {
  phase: Phase
  order: PlayerSummary[]
  currentOrderIdx: number
  presenter: PlayerSummary | undefined
  timerRemaining: number
}

export function PlayBoard({
  phase,
  order,
  currentOrderIdx,
  presenter,
  timerRemaining,
}: PlayBoardProps) {
  if (phase === 'round-order') {
    return (
      <main className={styles.board}>
        <div className={styles.panel}>
          <p className={styles.eyebrow}>Nowa runda</p>
          <h1 className={styles.title}>Kolejność prezentacji</h1>
          <div className={styles.orderList}>
            {order.map((player, idx) => (
              <div
                key={`${player.name}-${idx}`}
                className={idx === currentOrderIdx ? styles.orderItemActive : styles.orderItem}
              >
                <span className={styles.orderIndex}>{idx + 1}</span>
                <span className={styles.orderAvatar}>{player.avatar}</span>
                <span className={styles.orderName}>{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'timer-running') {
    return (
      <main className={styles.board}>
        <div className={styles.panel}>
          <PresenterCard presenter={presenter} subtitle="Ta osoba teraz pokazuje hasło" />
          <div className={styles.timer}>{timerRemaining}</div>
        </div>
      </main>
    )
  }

  if (phase === 'verdict') {
    return (
      <main className={styles.board}>
        <div className={styles.panel}>
          <PresenterCard presenter={presenter} subtitle="Czas minął. Podejmij decyzję dla tej tury." />
          <h1 className={styles.title}>Czy drużyna zgadła?</h1>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.board}>
      <div className={styles.panel}>
        <PresenterCard presenter={presenter} subtitle="Ta osoba jest teraz na ekranie telefonu." />
        <h1 className={styles.title}>Podaj telefon</h1>
        <p className={styles.message}>
          {phase === 'prepare'
            ? 'Gdy telefon będzie u prezentera, wyślij hasło na jego ekran.'
            : 'Hasło zostało wysłane. Czekamy, aż prezenter kliknie „Gotowy”.'}
        </p>
      </div>
    </main>
  )
}

function PresenterCard({
  presenter,
  subtitle,
}: {
  presenter: PlayerSummary | undefined
  subtitle: string
}) {
  return (
    <div className={styles.presenterCard}>
      <span className={styles.presenterAvatar}>{presenter?.avatar ?? '🎭'}</span>
      <div className={styles.presenterMeta}>
        <p className={styles.eyebrow}>Prezenter</p>
        <p className={styles.presenterName}>{presenter?.name ?? 'Brak gracza'}</p>
        <p className={styles.presenterSubtitle}>{subtitle}</p>
      </div>
    </div>
  )
}

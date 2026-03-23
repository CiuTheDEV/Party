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
        <section className={styles.stage}>
          <div className={styles.spotlight} />
          <div className={styles.stageIntro}>
            <p className={styles.eyebrow}>Nowa runda</p>
            <h1 className={styles.title}>Kolejnosc wejsc na scene</h1>
            <p className={styles.message}>Pierwsza osoba zaczyna od razu po starcie rundy.</p>
          </div>
          <div className={styles.orderList}>
            {order.map((player, idx) => (
              <div
                key={`${player.name}-${idx}`}
                className={idx === currentOrderIdx ? styles.orderItemActive : styles.orderItem}
              >
                <span className={styles.orderIndex}>{idx + 1}</span>
                <span className={styles.orderAvatar}>{player.avatar}</span>
                <div className={styles.orderMeta}>
                  <span className={styles.orderName}>{player.name}</span>
                  <span className={styles.orderHint}>
                    {idx === currentOrderIdx ? 'Startuje jako pierwszy' : 'Czeka na swoja kolej'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'timer-running') {
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          <div className={styles.spotlight} />
          <PresenterCard
            presenter={presenter}
            subtitle="Prezenter jest na scenie. Sala patrzy tylko na czas."
            compact
          />
          <div className={styles.timerWrap}>
            <p className={styles.eyebrow}>Zostalo czasu</p>
            <div className={styles.timer}>{timerRemaining}</div>
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'verdict') {
    return (
      <main className={styles.board}>
        <section className={styles.stage}>
          <div className={styles.spotlight} />
          <PresenterCard
            presenter={presenter}
            subtitle="To byl final tej tury. Wybierz werdykt ponizej."
          />
          <div className={styles.verdictPrompt}>
            <p className={styles.eyebrow}>Decyzja gospodarza</p>
            <h1 className={styles.title}>Czy druzyna zgadla haslo?</h1>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.spotlight} />
        <PresenterCard
          presenter={presenter}
          subtitle="Ta osoba bierze telefon i wychodzi na scene."
        />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            {phase === 'prepare' ? 'Przygotowanie' : 'Czekamy na gotowosc'}
          </p>
          <h1 className={styles.title}>Podaj telefon</h1>
          <p className={styles.message}>
            {phase === 'prepare'
              ? 'Gdy telefon bedzie u prezentera, wyslij haslo na jego ekran.'
              : 'Haslo zostalo wyslane. Czekamy, az prezenter kliknie "Gotowy".'}
          </p>
        </div>
      </section>
    </main>
  )
}

function PresenterCard({
  presenter,
  subtitle,
  compact = false,
}: {
  presenter: PlayerSummary | undefined
  subtitle: string
  compact?: boolean
}) {
  return (
    <div className={compact ? styles.presenterCardCompact : styles.presenterCard}>
      <span className={styles.presenterAvatar}>{presenter?.avatar ?? '??'}</span>
      <div className={styles.presenterMeta}>
        <p className={styles.eyebrow}>Prezenter</p>
        <p className={styles.presenterName}>{presenter?.name ?? 'Brak gracza'}</p>
        <p className={styles.presenterSubtitle}>{subtitle}</p>
      </div>
    </div>
  )
}

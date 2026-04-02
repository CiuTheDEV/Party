import styles from './ReconnectPresenterModal.module.css'

type Props = {
  connectionState: 'reconnecting' | 'error'
  onBackToMenu: () => void
}

export function RoomConnectionModal({ connectionState, onBackToMenu }: Props) {
  const isRecovering = connectionState === 'reconnecting'

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>
            {isRecovering ? 'Łączę ponownie z pokojem' : 'Problem z połączeniem z pokojem'}
          </span>
        </div>

        <div className={styles.body}>
          <div className={styles.info}>
            <span className={styles.eyebrow}>{isRecovering ? 'Gra wstrzymana' : 'Uwaga'}</span>
            <p className={styles.description}>
              {isRecovering
                ? 'Połączenie z serwerem gry chwilowo zniknęło. Czekaj chwilę, a plansza wznowi się automatycznie po odzyskaniu połączenia.'
                : 'Nie udało się utrzymać połączenia z serwerem gry. Jeśli problem nie zniknie po chwili, wróć do menu i uruchom rozgrywkę ponownie.'}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={onBackToMenu}>
            Wróć do menu
          </button>
        </div>
      </div>
    </div>
  )
}

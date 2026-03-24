'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { usePresenter } from '../../../../hooks/charades/usePresenter'
import styles from './page.module.css'

export default function PresentPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Łączenie…</div>}>
      <PresentScreen />
    </Suspense>
  )
}

function PresentScreen() {
  const params = useSearchParams()
  const roomId = params.get('room') ?? ''
  const { state, revealWord } = usePresenter(roomId)

  if (!roomId) {
    return <div className={styles.error}>Brak kodu pokoju. Zeskanuj QR ponownie.</div>
  }

  return (
    <div className={styles.screen}>
      {state.phase === 'your-turn' && (
        <div className={styles.turnView}>
          <p className={styles.presenterLabel}>{state.presenterName}, Twoja tura!</p>
          <div className={styles.hiddenWordCard}>
            <p className={styles.hiddenWordLabel}>Hasło jest gotowe</p>
            <div className={styles.hiddenWordMask}>••••••••</div>
            <p className={styles.category}>{state.category}</p>
          </div>
          <button className={styles.readyBtn} onClick={revealWord} disabled={!state.word}>
            Odkryj hasło
          </button>
        </div>
      )}

      {state.phase === 'reveal-buffer' && (
        <div className={styles.timerView}>
          <div className={styles.word}>{state.word}</div>
          <p className={styles.category}>{state.category}</p>
          <p className={styles.revealHint}>Zapamiętaj hasło. Za chwilę zniknie.</p>
          <div className={styles.timerBar}>
            <div
              className={styles.timerFill}
              style={{ width: `${(state.revealRemaining / 10) * 100}%` }}
            />
          </div>
          <span className={styles.timerCount}>{state.revealRemaining}s</span>
        </div>
      )}

      {state.phase === 'timer-running' && (
        <div className={styles.timerView}>
          <div className={styles.hiddenWordCard}>
            <p className={styles.hiddenWordLabel}>Hasło zostało ukryte</p>
            <div className={styles.hiddenWordMask}>••••••••</div>
          </div>
          <p className={styles.revealHint}>Teraz pokazuj hasło bez patrzenia na telefon.</p>
          <div className={styles.timerBar}>
            <div
              className={styles.timerFill}
              style={{ width: `${(state.timerRemaining / 60) * 100}%` }}
            />
          </div>
          <span className={styles.timerCount}>{state.timerRemaining}s</span>
        </div>
      )}

      {state.phase === 'timeout' && (
        <div className={styles.timeoutView}>
          <span className={styles.timeoutIcon}>⏰</span>
          <p className={styles.timeoutText}>Koniec czasu!</p>
          <p className={styles.timeoutSub}>Czekaj na werdykt hosta…</p>
        </div>
      )}

      {state.phase === 'between' && (
        <div className={styles.betweenView}>
          <p className={styles.betweenLabel}>Za chwilę następna tura</p>
          <span className={styles.nextAvatar}>{state.nextPresenterAvatar}</span>
          <p className={styles.nextName}>{state.nextPresenterName}</p>
          <p className={styles.betweenHint}>Podaj telefon tej osobie</p>
        </div>
      )}

      {state.phase === 'ended' && (
        <div className={styles.endedView}>
          <span className={styles.endedIcon}>🎉</span>
          <p className={styles.endedText}>Gra zakończona!</p>
          <p className={styles.endedSub}>Możesz zamknąć tę kartę.</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Eye } from 'lucide-react'

import styles from './PresenterPhaseYourTurn.module.css'

type PresenterPhaseYourTurnProps = {
  canReveal: boolean
  onRevealWord: () => boolean
}

const SUBMIT_RESET_MS = 3000

export function PresenterPhaseYourTurn({
  canReveal,
  onRevealWord,
}: PresenterPhaseYourTurnProps) {
  const isSubmittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isSubmitting) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }, SUBMIT_RESET_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isSubmitting])

  function handleRevealWord() {
    if (!canReveal || isSubmittingRef.current) {
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)
    const sent = onRevealWord()

    if (!sent) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.yourTurnLayout}>
      <section className={styles.readyCard}>
        <div className={styles.readyCardTop}>
          <div className={styles.metaBlock}>
            <p className={styles.hiddenWordLabel}>Karta hasla</p>
          </div>
        </div>
        <div className={styles.readyHero}>
          <span className={styles.hiddenWordIcon} aria-hidden="true">
            <Eye strokeWidth={2.2} />
          </span>
          <p className={styles.readyHint}>
            Odkryj haslo, gdy bedziesz gotowy. Potem masz 10 sekund na zapoznanie lub zmiane hasla.
          </p>
        </div>
      </section>

      <button
        className={styles.readyButton}
        onClick={handleRevealWord}
        disabled={!canReveal || isSubmitting}
      >
        Odkryj haslo
      </button>
    </div>
  )
}

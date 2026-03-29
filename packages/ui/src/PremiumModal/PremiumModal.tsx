'use client'

import { useEffect, useRef } from 'react'
import styles from './PremiumModal.module.css'

type PremiumModalProps = {
  onClose: () => void
}

export function PremiumModal({ onClose }: PremiumModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-modal-title"
    >
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.icon} aria-hidden="true">
          {'\uD83D\uDD12'}
        </div>
        <h2 className={styles.title} id="premium-modal-title">
          Tresc premium
        </h2>
        <p className={styles.description}>
          Ta gra bedzie dostepna wkrotce. Wroc za jakis czas.
        </p>
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          Zamknij
        </button>
      </div>
    </div>
  )
}

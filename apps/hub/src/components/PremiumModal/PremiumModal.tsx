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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>🔒</div>
        <h2 className={styles.title} id="premium-modal-title">
          Treść premium
        </h2>
        <p className={styles.description}>
          Ta gra będzie dostępna wkrótce. Wróć za jakiś czas!
        </p>
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          onClick={onClose}
        >
          Zamknij
        </button>
      </div>
    </div>
  )
}

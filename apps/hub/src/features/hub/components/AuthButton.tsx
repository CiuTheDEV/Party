'use client'

import { useClerk } from '@/app/providers'
import { useEffect, useRef, useState } from 'react'
import styles from './AuthButton.module.css'

export function AuthButton() {
  const { clerk, isLoaded, isSignedIn } = useClerk()
  const [showModal, setShowModal] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showModal || !clerk || !mountRef.current) return
    clerk.mountSignIn?.(mountRef.current)
    return () => {
      clerk.unmountSignIn?.(mountRef.current!)
    }
  }, [showModal, clerk])

  if (!isLoaded) {
    return <button type="button" className={styles.loginButton} disabled>Zaloguj</button>
  }

  if (isSignedIn) {
    return (
      <button
        type="button"
        className={styles.loginButton}
        onClick={() => clerk?.signOut(() => window.location.reload())}
      >
        Wyloguj
      </button>
    )
  }

  if (showModal) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowModal(false)}>
        <div onClick={e => e.stopPropagation()} ref={mountRef} />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={styles.loginButton}
      onClick={() => setShowModal(true)}
    >
      Zaloguj
    </button>
  )
}

'use client'

import { SignInButton, UserButton, useUser } from '@clerk/react'
import styles from './AuthButton.module.css'

export function AuthButton() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) return null

  if (isSignedIn) {
    return <UserButton />
  }

  return (
    <SignInButton mode="modal">
      <button type="button" className={styles.loginButton}>
        Zaloguj
      </button>
    </SignInButton>
  )
}

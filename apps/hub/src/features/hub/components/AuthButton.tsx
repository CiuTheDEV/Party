'use client'

import { SignInButton, UserButton, useUser } from '@clerk/react'

export function AuthButton() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) return null

  if (isSignedIn) {
    return <UserButton />
  }

  return (
    <SignInButton mode="modal">
      <button type="button">Zaloguj</button>
    </SignInButton>
  )
}

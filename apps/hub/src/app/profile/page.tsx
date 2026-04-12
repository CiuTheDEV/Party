'use client'

import { useUser } from '@clerk/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace('/sign-in?redirect_url=/profile')
    }
  }, [isLoaded, user, router])

  if (!isLoaded) {
    return null
  }

  if (!user) {
    return null
  }

  const displayName =
    user.username ??
    user.firstName ??
    user.emailAddresses[0]?.emailAddress.split('@')[0] ??
    'Gracz'

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' })
    : '—'

  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Profil</h1>
      <p><strong>Nick:</strong> {displayName}</p>
      <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
      <p><strong>Konto od:</strong> {memberSince}</p>
    </main>
  )
}

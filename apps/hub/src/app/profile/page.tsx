'use client'

import { useClerk } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { clerk, isLoaded, isSignedIn } = useClerk()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn || !clerk?.user) {
    return null
  }

  const user = clerk.user
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

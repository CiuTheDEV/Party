import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/profile')
  }

  const displayName =
    user.username ??
    user.firstName ??
    user.emailAddresses[0]?.emailAddress.split('@')[0] ??
    'Gracz'

  const memberSince = new Date(user.createdAt).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Profil</h1>
      <p><strong>Nick:</strong> {displayName}</p>
      <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
      <p><strong>Konto od:</strong> {memberSince}</p>
    </main>
  )
}

'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers'
import styles from './page.module.css'

function formatMemberSince(value: string) {
  return new Date(value).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
  })
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const memberSince = useMemo(() => (user ? formatMemberSince(user.createdAt) : null), [user])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth?next=/profile')
    }
  }, [isLoading, router, user])

  if (isLoading || !user) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.card}>
            <span className={styles.eyebrow}>Profil</span>
            <h1 className={styles.title}>Ładowanie konta</h1>
            <p className={styles.lead}>Sprawdzam aktywną sesję.</p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <span className={styles.eyebrow}>Profil</span>
          <h1 className={styles.title}>{user.displayName}</h1>
          <p className={styles.lead}>Twoje konto Project Party. Na tym etapie tylko podstawowe dane i logout.</p>

          <div className={styles.grid}>
            <div className={styles.row}>
              <span className={styles.label}>Email</span>
              <p className={styles.value}>{user.email}</p>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Konto od</span>
              <p className={styles.value}>{memberSince}</p>
            </div>
            {user.lastLoginAt ? (
              <div className={styles.row}>
                <span className={styles.label}>Ostatnie logowanie</span>
                <p className={styles.value}>{new Date(user.lastLoginAt).toLocaleString('pl-PL')}</p>
              </div>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={async () => {
                await logout()
                router.replace('/')
                router.refresh()
              }}
            >
              Wyloguj
            </button>
            <Link href="/" className={styles.secondaryAction}>
              Wróć do hubu
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

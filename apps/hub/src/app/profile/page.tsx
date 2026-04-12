'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CHARADES_CATEGORY_UNLOCK_ENTITLEMENT } from '@party/charades'
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
  const { user, isLoading, logout, redeemActivationCode, createActivationCode } = useAuth()
  const memberSince = useMemo(() => (user ? formatMemberSince(user.createdAt) : null), [user])
  const hasPremiumUnlock = Boolean(user?.entitlements.includes(CHARADES_CATEGORY_UNLOCK_ENTITLEMENT))
  const [activationCode, setActivationCode] = useState('')
  const [activationError, setActivationError] = useState<string | null>(null)
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null)
  const [isCreatingCode, setIsCreatingCode] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth?next=/profile')
    }
  }, [isLoading, router, user])

  async function handleActivationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActivationError(null)
    setActivationSuccess(null)
    setIsRedeeming(true)

    try {
      await redeemActivationCode(activationCode)
      setActivationCode('')
      setActivationSuccess('Kod został aktywowany. Kategorie w Kalamburach są teraz odblokowane.')
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : 'Nie udało się aktywować kodu.')
    } finally {
      setIsRedeeming(false)
    }
  }

  async function handleAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdminError(null)
    setAdminSuccess(null)
    setIsCreatingCode(true)

    try {
      const createdCode = await createActivationCode(adminCode)
      setAdminCode(createdCode)
      setAdminSuccess(`Utworzono kod: ${createdCode}`)
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Nie udało się utworzyć kodu.')
    } finally {
      setIsCreatingCode(false)
    }
  }

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

          <section className={styles.activationPanel}>
            <div className={styles.activationCopy}>
              <span className={styles.activationEyebrow}>Kod aktywacyjny</span>
              <h2 className={styles.activationTitle}>{hasPremiumUnlock ? 'Kategorie odblokowane' : 'Odblokuj kategorie'}</h2>
              <p className={styles.activationLead}>
                Po aktywacji w Kalamburach pojawią się dodatkowe kategorie oznaczone kłódką.
              </p>
            </div>

            {hasPremiumUnlock ? (
              <div className={styles.activationStatus}>
                <span className={styles.statusDot} />
                <span>Pakiet kategorii aktywny</span>
              </div>
            ) : (
              <form className={styles.activationForm} onSubmit={handleActivationSubmit}>
                <label className={styles.activationField}>
                  <span className={styles.label}>Kod</span>
                  <input
                    className={styles.input}
                    value={activationCode}
                    onChange={(event) => setActivationCode(event.target.value)}
                    autoComplete="off"
                    placeholder="KALAMBURY-START"
                    required
                  />
                </label>

                {activationError ? <p className={styles.error}>{activationError}</p> : null}
                {activationSuccess ? <p className={styles.success}>{activationSuccess}</p> : null}

                <button type="submit" className={styles.submit} disabled={isRedeeming}>
                  {isRedeeming ? 'Aktywuję...' : 'Aktywuj kod'}
                </button>
              </form>
            )}
          </section>

          {user.isAdmin ? (
            <section className={styles.adminPanel}>
              <div className={styles.activationCopy}>
                <span className={styles.activationEyebrow}>Admin panel</span>
                <h2 className={styles.activationTitle}>Tworzenie kodów aktywacyjnych</h2>
                <p className={styles.activationLead}>
                  Ten panel widzi wyłącznie konto Bullet. Dostęp do niego jest sprawdzany po stronie serwera.
                </p>
              </div>

              <form className={styles.activationForm} onSubmit={handleAdminSubmit}>
                <label className={styles.activationField}>
                  <span className={styles.label}>Nowy kod</span>
                  <input
                    className={styles.input}
                    value={adminCode}
                    onChange={(event) => setAdminCode(event.target.value)}
                    autoComplete="off"
                    placeholder="KALAMBURY-2026"
                    required
                  />
                </label>

                {adminError ? <p className={styles.error}>{adminError}</p> : null}
                {adminSuccess ? <p className={styles.success}>{adminSuccess}</p> : null}

                <button type="submit" className={styles.submit} disabled={isCreatingCode}>
                  {isCreatingCode ? 'Tworzę...' : 'Utwórz kod'}
                </button>
              </form>
            </section>
          ) : null}

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

'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthApiUrl } from '../../lib/auth/auth-api'
import { useAuth } from '../providers'
import styles from './page.module.css'

type Mode = 'login' | 'register'

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: { message?: string } }
    return payload.error?.message ?? 'Nie udało się wykonać operacji.'
  } catch {
    return 'Nie udało się wykonać operacji.'
  }
}

export default function AuthPageClient({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const { user, isLoading, refresh } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath)
    }
  }, [isLoading, nextPath, router, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const endpoint = mode === 'login' ? getAuthApiUrl('/login') : getAuthApiUrl('/register')
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          displayName,
          password,
        }),
      })

      if (!response.ok) {
        setError(await readErrorMessage(response))
        return
      }

      await refresh()
      router.replace(nextPath)
      router.refresh()
    } catch {
      setError('Nie udało się połączyć z serwerem.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <span className={styles.eyebrow}>Project Party</span>
          <h1 className={styles.title}>{mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}</h1>
          <p className={styles.lead}>
            Konto na razie działa dla każdego. Bez weryfikacji e-maila, bez resetu hasła, bez dodatkowych usług.
          </p>

          <div className={styles.tabs} role="tablist" aria-label="Tryb logowania">
            <button
              type="button"
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => setMode('login')}
            >
              Logowanie
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => setMode('register')}
            >
              Rejestracja
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <label className={styles.field}>
                <span className={styles.label}>Nazwa gracza</span>
                <input
                  className={styles.input}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                  placeholder="Mati"
                  required={mode === 'register'}
                />
              </label>
            ) : null}

            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="mateo@example.com"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Hasło</span>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Minimum 8 znaków"
                required
              />
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              {mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
            </button>
          </form>

          <p className={styles.footer}>
            Powrót po sukcesie: <code>{nextPath}</code>
          </p>
        </section>
      </div>
    </main>
  )
}

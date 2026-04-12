'use client'

import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BadgeCheck,
  Copy,
  Gauge,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react'
import { getPartyAvatarAssetSrc } from '@party/ui'
import { AuthButton } from '@/features/hub/components/AuthButton'
import { getAuthApiUrl } from '../../lib/auth/auth-api'
import { useAuth } from '../providers'
import styles from './page.module.css'

const headingFont = { className: '' }
const bodyFont = { className: '' }
const PREMIUM_ENTITLEMENT_KEY = 'charades_category_pack'
const PERPETUAL_GRANT_EXPIRES_AT = '9999-12-31T23:59:59.000Z'

type AdminTab = 'codes' | 'premium'

type ActivationCode = {
  id: string
  code: string
  entitlementKey: string
  createdAt: string
  codeExpiresAt: string | null
  unlockDurationMinutes: number
  redeemedByUserId: string | null
  redeemedAt: string | null
  expiresAt: string | null
  status: 'active' | 'expired' | 'pending'
  isManualGrant: boolean
}

type PremiumGrant = {
  id: string
  userId: string
  userEmail: string
  userDisplayName: string
  entitlementKey: string
  createdAt: string
  expiresAt: string
}

type AdminUser = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  avatarId: string
  premiumActive: boolean
  manualGrant: PremiumGrant | null
  activeEntitlements: Array<{
    entitlementKey: string
    expiresAt: string
    source: 'code' | 'manual'
  }>
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: { message?: string } }
    return payload.error?.message ?? 'Nie udało się wykonać operacji.'
  } catch {
    return 'Nie udało się wykonać operacji.'
  }
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    credentials: 'include',
    ...init,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as T
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCodeStatus(status: ActivationCode['status']) {
  switch (status) {
    case 'active':
      return 'Aktywny'
    case 'expired':
      return 'Wygasły'
    default:
      return 'Oczekuje'
  }
}

function formatPremiumStatus(user: AdminUser) {
  if (user.manualGrant) return 'Ręczny grant'
  if (user.premiumActive) return 'Premium aktywne'
  return 'Bez dostępu'
}

function formatGrantExpiry(iso: string) {
  return iso === PERPETUAL_GRANT_EXPIRES_AT ? 'Na stałe' : formatDateTime(iso)
}

function buildSummaryCards(codes: ActivationCode[], grants: PremiumGrant[], users: AdminUser[]) {
  return [
    {
      label: 'Publiczne kody',
      value: codes.length,
      meta: 'Dla graczy wpisujących kod samodzielnie.',
    },
    {
      label: 'Ręczne granty',
      value: grants.length,
      meta: 'Premium przyznane konkretnym kontom.',
    },
    {
      label: 'Użytkownicy z premium',
      value: users.filter((user) => user.premiumActive).length,
      meta: 'Konta z aktywnym dostępem do treści premium.',
    },
  ]
}

export default function AdminPageClient() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [activeTab, setActiveTab] = useState<AdminTab>('codes')
  const [publicCodes, setPublicCodes] = useState<ActivationCode[]>([])
  const [premiumGrants, setPremiumGrants] = useState<PremiumGrant[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userQuery, setUserQuery] = useState('')
  const [codeInput, setCodeInput] = useState('KALAMBURY-')
  const [codeValidityMinutes, setCodeValidityMinutes] = useState('60')
  const [unlockDurationMinutes, setUnlockDurationMinutes] = useState('60')
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [isLoadingPremium, setIsLoadingPremium] = useState(false)
  const [isCreatingCode, setIsCreatingCode] = useState(false)
  const [pendingGrantUserId, setPendingGrantUserId] = useState<string | null>(null)
  const [pendingRevokeGrantId, setPendingRevokeGrantId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const summaryCards = useMemo(() => buildSummaryCards(publicCodes, premiumGrants, users), [publicCodes, premiumGrants, users])

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/auth?next=/admin')
      return
    }
    if (!user.isAdmin) {
      router.replace('/')
    }
  }, [isLoading, router, user])

  async function loadCodes() {
    setIsLoadingCodes(true)

    try {
      const payload = await fetchJson<{ activationCodes: ActivationCode[] }>(getAuthApiUrl('/admin/activation-codes'))
      setPublicCodes(payload.activationCodes)
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Nie udało się pobrać kodów.' })
    } finally {
      setIsLoadingCodes(false)
    }
  }

  async function loadPremium(query = userQuery) {
    setIsLoadingPremium(true)

    try {
      const [usersPayload, grantsPayload] = await Promise.all([
        fetchJson<{ users: AdminUser[] }>(`${getAuthApiUrl('/admin/users')}?query=${encodeURIComponent(query)}`),
        fetchJson<{ grants: PremiumGrant[] }>(getAuthApiUrl('/admin/premium-grants')),
      ])

      setUsers(usersPayload.users)
      setPremiumGrants(grantsPayload.grants)
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Nie udało się pobrać premium.' })
    } finally {
      setIsLoadingPremium(false)
    }
  }

  useEffect(() => {
    if (!user?.isAdmin || activeTab !== 'codes') return
    void loadCodes()
  }, [activeTab, user?.isAdmin])

  useEffect(() => {
    if (!user?.isAdmin || activeTab !== 'premium') return undefined

    const timeoutId = window.setTimeout(() => {
      void loadPremium()
    }, 240)

    return () => window.clearTimeout(timeoutId)
  }, [activeTab, user?.isAdmin, userQuery])

  async function handleCreateCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    setIsCreatingCode(true)

    try {
      const response = await fetch(getAuthApiUrl('/admin/create-code'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeInput.trim(),
          codeValidityMinutes: Number(codeValidityMinutes),
          unlockDurationMinutes: Number(unlockDurationMinutes),
        }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const payload = (await response.json()) as { activationCode?: { code?: string } }
      setNotice({ tone: 'success', text: `Kod ${payload.activationCode?.code ?? codeInput.trim()} został utworzony.` })
      setCodeInput('KALAMBURY-')
      await loadCodes()
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Nie udało się utworzyć kodu.' })
    } finally {
      setIsCreatingCode(false)
    }
  }

  async function handleGrantPremium(userId: string) {
    setPendingGrantUserId(userId)
    setNotice(null)

    try {
      const response = await fetch(getAuthApiUrl('/admin/premium-grants'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          entitlementKey: PREMIUM_ENTITLEMENT_KEY,
        }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setNotice({ tone: 'success', text: 'Ręczny dostęp został przyznany.' })
      await loadPremium()
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Nie udało się przyznać dostępu.' })
    } finally {
      setPendingGrantUserId(null)
    }
  }

  async function handleRevokePremium(grantId: string) {
    setPendingRevokeGrantId(grantId)
    setNotice(null)

    try {
      const response = await fetch(getAuthApiUrl('/admin/premium-grants'), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grantId }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setNotice({ tone: 'success', text: 'Ręczny dostęp został odebrany.' })
      await loadPremium()
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Nie udało się odebrać dostępu.' })
    } finally {
      setPendingRevokeGrantId(null)
    }
  }

  async function copyCode(value: string) {
    await navigator.clipboard.writeText(value)
    setNotice({ tone: 'success', text: `Skopiowano kod ${value}.` })
  }

  if (isLoading || !user || !user.isAdmin) {
    return (
      <main className={`${styles.page} ${bodyFont.className}`}>
        <div className={styles.backdrop} />
        <section className={styles.shell}>
          <div className={styles.hero}>
            <div className={styles.heroHeader}>
              <Link href="/" className={styles.backLink}>
                Wróć do hubu
              </Link>
              <AuthButton />
            </div>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Panel admina</span>
              <h1 className={`${styles.title} ${headingFont.className}`}>Ładowanie panelu</h1>
              <p className={styles.lead}>Sprawdzam uprawnienia i przygotowuję dane.</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const activeTabLabel = activeTab === 'codes' ? 'Kody aktywacyjne' : 'Dostęp premium'

  return (
    <main className={`${styles.page} ${bodyFont.className}`}>
      <div className={styles.backdrop} aria-hidden="true" />

      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroHeader}>
            <Link href="/" className={styles.backLink}>
              Wróć do hubu
            </Link>
            <AuthButton />
          </div>

          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Panel admina</span>
            <h1 className={`${styles.title} ${headingFont.className}`}>Kody, granty i premium</h1>
            <p className={styles.lead}>
              Osobna przestrzeń dla publicznych kodów i ręcznego premium. Karty są oddzielone, żeby nie mieszać
              operacji jednorazowych z obsługą kont.
            </p>
          </div>

          <div className={styles.summaryGrid}>
            {summaryCards.map((card) => (
              <article key={card.label} className={styles.summaryCard}>
                <span className={styles.summaryLabel}>{card.label}</span>
                <strong className={`${styles.summaryValue} ${headingFont.className}`}>{card.value}</strong>
                <p className={styles.summaryMeta}>{card.meta}</p>
              </article>
            ))}
          </div>
        </header>

        <div className={styles.tabBar} role="tablist" aria-label="Sekcje panelu admina">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'codes'}
            className={`${styles.tabButton} ${activeTab === 'codes' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('codes')}
          >
            <Ticket size={18} />
            <span>
              <strong>Kody aktywacyjne</strong>
              <small>Publiczne kody dla graczy</small>
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'premium'}
            className={`${styles.tabButton} ${activeTab === 'premium' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('premium')}
          >
            <ShieldCheck size={18} />
            <span>
              <strong>Dostęp premium</strong>
              <small>Ręczne granty dla kont</small>
            </span>
          </button>
        </div>

        {notice ? (
          <div className={`${styles.notice} ${notice.tone === 'success' ? styles.noticeSuccess : styles.noticeError}`}>
            {notice.text}
          </div>
        ) : null}

        {activeTab === 'codes' ? (
          <section className={styles.tabGrid} aria-label="Kody aktywacyjne">
            <form className={styles.card} onSubmit={handleCreateCode}>
              <div className={styles.cardHeader}>
                <span className={styles.cardEyebrow}>Nowy kod</span>
                <h2 className={`${styles.cardTitle} ${headingFont.className}`}>Wygeneruj publiczny kod</h2>
                <p className={styles.cardLead}>
                  Kod trafia do graczy. Wciąż odblokowuje ten sam pakiet kategorii, ale nie jest przypięty do jednego
                  konta.
                </p>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span className={styles.label}>Kod</span>
                  <input
                    className={styles.input}
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value)}
                    placeholder="KALAMBURY-2026"
                    required
                    spellCheck={false}
                    autoComplete="off"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Ważność kodu (min)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    value={codeValidityMinutes}
                    onChange={(event) => setCodeValidityMinutes(event.target.value)}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Długość dostępu (min)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    value={unlockDurationMinutes}
                    onChange={(event) => setUnlockDurationMinutes(event.target.value)}
                    required
                  />
                </label>
              </div>

              <button className={styles.primaryButton} type="submit" disabled={isCreatingCode || !codeInput.trim()}>
                <Plus size={18} />
                {isCreatingCode ? 'Tworzę kod...' : 'Wygeneruj kod'}
              </button>

              <p className={styles.helperText}>
                Ten formularz tworzy tylko publiczny kod. Ręczne granty są w drugiej karcie.
              </p>
            </form>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardEyebrow}>Ostatnie kody</span>
                <h2 className={`${styles.cardTitle} ${headingFont.className}`}>Aktywność kodów</h2>
                <p className={styles.cardLead}>
                  Szybki podgląd najnowszych kodów i ich stanu. Kopiowanie działa bez opuszczania panelu.
                </p>
              </div>

              {isLoadingCodes ? (
                <div className={styles.emptyState}>
                  <Gauge size={20} />
                  <p>Ładuję kody...</p>
                </div>
              ) : publicCodes.length > 0 ? (
                <div className={styles.list}>
                  {publicCodes.map((code) => (
                    <article key={code.id} className={styles.listRow}>
                      <div className={styles.listRowMain}>
                        <div className={styles.codeLine}>
                          <code className={styles.code}>{code.code}</code>
                          <span
                            className={`${styles.statusPill} ${
                              code.status === 'active'
                                ? styles.statusActive
                                : code.status === 'expired'
                                  ? styles.statusExpired
                                  : styles.statusPending
                            }`}
                          >
                            {formatCodeStatus(code.status)}
                          </span>
                        </div>
                        <p className={styles.listMeta}>
                          {code.redeemedAt ? `Wykorzystany ${formatDateTime(code.redeemedAt)}` : `Utworzony ${formatDateTime(code.createdAt)}`}
                        </p>
                        <p className={styles.listMeta}>
                          {code.codeExpiresAt ? `Wygasa kod: ${formatDateTime(code.codeExpiresAt)}` : 'Bez terminu wygaśnięcia kodu'}
                        </p>
                      </div>

                      <div className={styles.listRowActions}>
                        <button type="button" className={styles.ghostButton} onClick={() => copyCode(code.code)}>
                          <Copy size={16} />
                          Kopiuj
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Ticket size={20} />
                  <p>Brak kodów do pokazania.</p>
                </div>
              )}
            </article>
          </section>
        ) : (
          <section className={styles.tabGrid} aria-label="Dostęp premium">
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardEyebrow}>Nadaj dostęp</span>
                <h2 className={`${styles.cardTitle} ${headingFont.className}`}>Wyszukaj użytkownika</h2>
                <p className={styles.cardLead}>
                  Ręczny grant trafia do konta bez generowania widocznego kodu. Dla tego panelu używany jest tylko
                  pakiet kategorii Charades.
                </p>
              </div>

              <label className={styles.searchField}>
                <Search size={18} aria-hidden="true" />
                <input
                  className={styles.searchInput}
                  type="search"
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="Szukaj po emailu albo nazwie..."
                  autoComplete="off"
                />
              </label>

              <div className={styles.helperRow}>
                <span className={styles.helperChip}>
                  <KeyRound size={14} />
                  {PREMIUM_ENTITLEMENT_KEY}
                </span>
                <span className={styles.helperText}>Ręczny grant jest aktywny do momentu odwołania.</span>
              </div>

              {isLoadingPremium ? (
                <div className={styles.emptyState}>
                  <Gauge size={20} />
                  <p>Ładuję użytkowników...</p>
                </div>
              ) : users.length > 0 ? (
                <div className={styles.userList}>
                  {users.map((targetUser) => {
                    const avatarSrc = getPartyAvatarAssetSrc(targetUser.avatarId, 'static').src
                    const manualGrant = targetUser.manualGrant
                    const hasManualGrant = Boolean(manualGrant)
                    const canGrant = !targetUser.premiumActive

                    return (
                      <article key={targetUser.id} className={styles.userCard}>
                        <div className={styles.userTop}>
                          <img className={styles.userAvatar} src={avatarSrc} alt="" width={44} height={44} />
                          <div className={styles.userCopy}>
                            <h3 className={`${styles.userTitle} ${headingFont.className}`}>{targetUser.displayName}</h3>
                            <p className={styles.userEmail}>{targetUser.email}</p>
                            <p className={styles.userMeta}>Dołączył {formatDate(targetUser.createdAt)}</p>
                          </div>
                        </div>

                        <div className={styles.userBadges}>
                          <span
                            className={`${styles.statusPill} ${
                              targetUser.premiumActive ? styles.statusActive : styles.statusExpired
                            }`}
                          >
                            {formatPremiumStatus(targetUser)}
                          </span>
                          {targetUser.manualGrant ? (
                            <span className={`${styles.statusPill} ${styles.statusManual}`}>Ręczny grant</span>
                          ) : null}
                        </div>

                        {targetUser.activeEntitlements.length > 0 ? (
                          <div className={styles.entitlementList}>
                            {targetUser.activeEntitlements.map((entry) => (
                              <span key={`${entry.entitlementKey}-${entry.expiresAt}`} className={styles.entitlementChip}>
                                {entry.source === 'manual' ? 'Manual' : 'Kod'} · {entry.entitlementKey}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.userMeta}>Brak aktywnych uprawnień premium.</p>
                        )}

                        <div className={styles.userActions}>
                          {hasManualGrant ? (
                            <>
                              <span className={styles.actionHint}>
                                Ręczny grant: {formatGrantExpiry(manualGrant!.expiresAt)}
                              </span>
                              <button
                                type="button"
                                className={styles.secondaryButton}
                                disabled={pendingRevokeGrantId === manualGrant!.id}
                                onClick={() => handleRevokePremium(manualGrant!.id)}
                              >
                                {pendingRevokeGrantId === manualGrant!.id ? 'Odbieram...' : 'Odbierz grant'}
                              </button>
                            </>
                          ) : canGrant ? (
                            <button
                              type="button"
                              className={styles.primaryButton}
                              disabled={pendingGrantUserId === targetUser.id}
                              onClick={() => handleGrantPremium(targetUser.id)}
                            >
                              <BadgeCheck size={16} />
                              {pendingGrantUserId === targetUser.id ? 'Nadaję...' : 'Nadaj premium'}
                            </button>
                          ) : (
                            <span className={styles.actionHint}>
                              Użytkownik już ma aktywny dostęp. Grant z panelu można dodać dopiero po odwołaniu
                              obecnego.
                            </span>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Users size={20} />
                  <p>Nie znaleziono użytkowników dla tego wyszukiwania.</p>
                </div>
              )}
            </article>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardEyebrow}>Aktywne granty</span>
                <h2 className={`${styles.cardTitle} ${headingFont.className}`}>Ręczne premium</h2>
                <p className={styles.cardLead}>To są tylko granty przyznane z panelu. Kody wpisywane przez graczy pozostają osobno.</p>
              </div>

              {isLoadingPremium ? (
                <div className={styles.emptyState}>
                  <Gauge size={20} />
                  <p>Ładuję granty...</p>
                </div>
              ) : premiumGrants.length > 0 ? (
                <div className={styles.list}>
                  {premiumGrants.map((grant) => (
                    <article key={grant.id} className={styles.listRow}>
                      <div className={styles.listRowMain}>
                        <div className={styles.codeLine}>
                          <span className={styles.userGrantName}>{grant.userDisplayName || grant.userEmail}</span>
                          <span className={`${styles.statusPill} ${styles.statusManual}`}>Manual</span>
                        </div>
                        <p className={styles.listMeta}>{grant.userEmail}</p>
                        <p className={styles.listMeta}>Wygasa {formatGrantExpiry(grant.expiresAt)}</p>
                      </div>

                      <div className={styles.listRowActions}>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={pendingRevokeGrantId === grant.id}
                          onClick={() => handleRevokePremium(grant.id)}
                        >
                          {pendingRevokeGrantId === grant.id ? 'Odbieram...' : 'Odbierz'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <ShieldCheck size={20} />
                  <p>Brak aktywnych ręcznych grantów.</p>
                </div>
              )}
            </article>
          </section>
        )}

        <footer className={styles.footerNote}>
          <span>{activeTabLabel}</span>
          <span>Pakiet premium: {PREMIUM_ENTITLEMENT_KEY}</span>
        </footer>
      </section>
    </main>
  )
}

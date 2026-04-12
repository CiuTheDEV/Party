'use client'

import { useState } from 'react'
import { getPartyAvatarAssetSrc } from '@party/ui'
import { useAuth, useProfileModal } from '@/app/providers'
import { AvatarPickerPanel } from './AvatarPickerPanel'
import styles from './ProfileModal.module.css'

type Tab = 'konto' | 'dostep'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ProfileModal() {
  const { user, logout, redeemActivationCode, updateAvatar } = useAuth()
  const { isOpen, closeProfile } = useProfileModal()

  const [activeTab, setActiveTab] = useState<Tab>('konto')
  const [showPicker, setShowPicker] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeSuccess, setCodeSuccess] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  if (!isOpen || !user) return null

  async function handleLogout() {
    closeProfile()
    await logout()
  }

  async function handleRedeemCode(e: React.FormEvent) {
    e.preventDefault()
    setCodeError('')
    setCodeSuccess(false)
    setCodeLoading(true)

    try {
      await redeemActivationCode(codeInput.trim())
      setCodeSuccess(true)
      setCodeInput('')
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Nie udało się aktywować kodu.')
    } finally {
      setCodeLoading(false)
    }
  }

  async function handleAvatarAccept(avatarId: string) {
    setShowPicker(false)
    setAvatarLoading(true)

    try {
      await updateAvatar(avatarId)
    } catch {
      // avatar stays as-is on failure
    } finally {
      setAvatarLoading(false)
    }
  }

  const hasAccess = user.entitlements.includes('charades_category_pack')

  return (
    <>
      <div className={styles.backdrop} onClick={closeProfile} aria-hidden />

      <div className={styles.modal} role="dialog" aria-modal aria-label="Profil gracza">
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.avatarBtn}
            onClick={() => setShowPicker(true)}
            aria-label="Zmień awatar"
            disabled={avatarLoading}
          >
            <img
              src={getPartyAvatarAssetSrc(user.avatarId, 'static').src}
              alt="Twój awatar"
              width={56}
              height={56}
              className={styles.avatarImg}
            />
            <span className={styles.avatarOverlay}>Zmień</span>
          </button>

          <div className={styles.identity}>
            <span className={styles.displayName}>{user.displayName}</span>
            <span className={styles.email}>{user.email}</span>
          </div>

          <div className={styles.headerActions}>
            {user.isAdmin && (
              <a href="/admin" className={styles.adminBtn} onClick={closeProfile}>
                Admin
              </a>
            )}
            <button className={styles.closeBtn} onClick={closeProfile} aria-label="Zamknij">
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'konto' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('konto')}
          >
            Konto
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'dostep' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('dostep')}
          >
            Dostęp
          </button>
          <span
            className={styles.tabSlider}
            style={{ '--tab-index': activeTab === 'konto' ? 0 : 1 } as React.CSSProperties}
          />
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Konto panel */}
          <div
            className={`${styles.panel} ${activeTab === 'konto' && !showPicker ? styles.panelVisible : ''}`}
            aria-hidden={activeTab !== 'konto' || showPicker}
          >
            <div className={styles.dataGrid}>
              <div className={styles.cell}>
                <span className={styles.cellLabel}>Nazwa gracza</span>
                <span className={styles.cellValue}>{user.displayName}</span>
              </div>
              <div className={styles.cell}>
                <span className={styles.cellLabel}>Konto od</span>
                <span className={styles.cellValue}>{formatDate(user.createdAt)}</span>
              </div>
              <div className={`${styles.cell} ${styles.cellFull}`}>
                <span className={styles.cellLabel}>Email</span>
                <span className={styles.cellValue}>{user.email}</span>
              </div>
              <div
                className={`${styles.cell} ${styles.cellFull} ${styles.avatarCell}`}
                role="button"
                tabIndex={0}
                onClick={() => setShowPicker(true)}
                onKeyDown={(e) => e.key === 'Enter' && setShowPicker(true)}
              >
                <img
                  src={getPartyAvatarAssetSrc(user.avatarId, 'static').src}
                  alt="Awatar"
                  width={32}
                  height={32}
                />
                <span className={styles.cellLabel}>Kliknij żeby zmienić awatar</span>
              </div>
            </div>

            <div className={styles.logoutRow}>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Wyloguj
              </button>
            </div>
          </div>

          {/* Dostęp panel */}
          <div
            className={`${styles.panel} ${activeTab === 'dostep' && !showPicker ? styles.panelVisible : ''}`}
            aria-hidden={activeTab !== 'dostep' || showPicker}
          >
            <div className={`${styles.accessCard} ${hasAccess ? styles.accessCardActive : ''}`}>
              <div className={styles.accessCardHeader}>
                <span className={styles.accessCardTitle}>Pakiet kategorii</span>
                {hasAccess ? (
                  <span className={`${styles.badge} ${styles.badgeActive}`}>Aktywny</span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeLocked}`}>🔒 Zablokowane</span>
                )}
              </div>
              {hasAccess && user.unlockExpiresAt ? (
                <p className={styles.accessExpiry}>Wygasa: {formatDateTime(user.unlockExpiresAt)}</p>
              ) : (
                <p className={styles.accessHint}>Wprowadź kod żeby odblokować dodatkowe kategorie.</p>
              )}
            </div>

            {!hasAccess && (
              <form className={styles.codeForm} onSubmit={handleRedeemCode}>
                <div className={styles.codeInputRow}>
                  <input
                    className={styles.codeInput}
                    type="text"
                    placeholder="Kod aktywacyjny"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    disabled={codeLoading}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    className={styles.activateBtn}
                    type="submit"
                    disabled={codeLoading || !codeInput.trim()}
                  >
                    {codeLoading ? '...' : 'Aktywuj'}
                  </button>
                </div>
                {codeError && <p className={styles.codeError}>{codeError}</p>}
                {codeSuccess && <p className={styles.codeSuccess}>Kod aktywowany!</p>}
              </form>
            )}
          </div>

          {/* Avatar picker panel */}
          <div
            className={`${styles.panel} ${showPicker ? styles.panelVisible : ''}`}
            aria-hidden={!showPicker}
          >
            <AvatarPickerPanel
              currentAvatarId={user.avatarId}
              onAccept={handleAvatarAccept}
              onCancel={() => setShowPicker(false)}
            />
          </div>
        </div>
      </div>
    </>
  )
}

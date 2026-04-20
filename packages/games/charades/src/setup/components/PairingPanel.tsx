'use client'

import { useEffect, useState } from 'react'
import { Link2, Smartphone } from 'lucide-react'
import { DevicePairingModal } from '@party/ui'
import { buildPresenterUrl, getPresenterOrigin, isLocalPresenterOrigin } from '../runtime'
import styles from './PairingPanel.module.css'

type Props = {
  roomId: string
  isConnected: boolean
  onDisconnect: () => void
}

export function PairingPanel({ roomId, isConnected, onDisconnect }: Props) {
  const [presenterUrl, setPresenterUrl] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const origin = getPresenterOrigin()
    setPresenterUrl(origin ? buildPresenterUrl(origin, roomId) : '')
  }, [roomId])

  useEffect(() => {
    if (isConnected) {
      setShowModal(false)
    }
  }, [isConnected])

  useEffect(() => {
    if (copyState === 'idle') return

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [copyState])

  const sessionCode = roomId.toUpperCase()
  const showLocalhostWarning = presenterUrl !== '' && isLocalPresenterOrigin(presenterUrl)
  const copyHint =
    copyState === 'success'
      ? 'Skopiowano'
      : copyState === 'error'
        ? 'Nie udalo sie skopiowac'
        : 'Kliknij, aby skopiowac'
  const handleCopySessionCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode)
      setCopyState('success')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.label}>Dodatkowe urządzenia</span>
            <p className={styles.desc}>
              Podłącz telefon prezentera. Zobaczy hasło, odliczanie i ekran swojej tury.
            </p>
          </div>
          <span className={`${styles.badge} ${isConnected ? styles.badgeConnected : ''}`}>
            {isConnected ? 'Połączono' : 'Niepołączono'}
          </span>
        </div>

        {isConnected ? (
          <div className={styles.connectedRow}>
            <div className={styles.connectedInfo}>
              <span className={styles.connectedIconWrap}>
                <Smartphone size={18} className={styles.connectedIcon} />
              </span>
              <div className={styles.connectedCopy}>
                <span className={styles.connectedText}>Urządzenie połączone</span>
                <span className={styles.connectedSubtle}>Telefon prezentera jest gotowy do gry.</span>
              </div>
            </div>
            <button type="button" className={styles.disconnectBtn} onClick={onDisconnect}>
              Rozłącz
            </button>
          </div>
        ) : (
          <button type="button" className={styles.addBtn} onClick={() => setShowModal(true)}>
            <span className={styles.addBtnIcon}>
              <Link2 size={18} />
            </span>
            Dodaj urządzenia
          </button>
        )}
      </div>

      {showModal ? (
        <DevicePairingModal
          eyebrow="Parowanie"
          title="Podłącz urządzenie prezentera"
          qrValue={presenterUrl}
          roleLabel="Tryb: prezenter"
          description="Zeskanuj kod telefonem prezentera. Na ekranie pojawi się karta hasła i czas tury."
          warning={
            showLocalhostWarning ? (
              <>
                Ten QR wskazuje na localhost. Na prawdziwym telefonie otwórz hosta po adresie sieciowym albo ustaw
                `NEXT_PUBLIC_PUBLIC_ORIGIN` i `NEXT_PUBLIC_PARTYKIT_HOST`.
              </>
            ) : null
          }
          sessionCode={sessionCode}
          copyHint={copyHint}
          onCopy={handleCopySessionCode}
          onOpenExternal={() => {
            if (!presenterUrl) return
            window.open(presenterUrl, '_blank', 'noopener,noreferrer')
          }}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)}>
                Zamknij
              </button>
              <button
                type="button"
                className={styles.disconnectAllBtn}
                onClick={() => {
                  onDisconnect()
                  setShowModal(false)
                }}
              >
                Rozłącz wszystkie urządzenia
              </button>
            </>
          }
        />
      ) : null}
    </>
  )
}

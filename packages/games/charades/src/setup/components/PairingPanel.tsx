'use client'

import { useEffect, useState } from 'react'
import { Link2, Smartphone } from 'lucide-react'
import { AlertDialog, DevicePairingModal } from '@party/ui'
import { buildPresenterUrl, getPresenterOrigin, isLocalPresenterOrigin } from '../runtime'
import styles from './PairingPanel.module.css'

type Props = {
  roomId: string
  isConnected: boolean
  isModalOpen: boolean
  onDisconnect: () => void
  onRegenerateSessionCode: () => void
  onOpenModal: () => void
  onCloseModal: () => void
}

export function PairingPanel({
  roomId,
  isConnected,
  isModalOpen,
  onDisconnect,
  onRegenerateSessionCode,
  onOpenModal,
  onCloseModal,
}: Props) {
  const [presenterUrl, setPresenterUrl] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')
  const [isDisconnectConfirmOpen, setIsDisconnectConfirmOpen] = useState(false)
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false)

  useEffect(() => {
    const origin = getPresenterOrigin()
    setPresenterUrl(origin ? buildPresenterUrl(origin, roomId) : '')
  }, [roomId])

  useEffect(() => {
    if (copyState === 'idle') return

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [copyState])

  const showLocalhostWarning = presenterUrl !== '' && isLocalPresenterOrigin(presenterUrl)
  const copyHint =
    copyState === 'success'
      ? 'Skopiowano'
      : copyState === 'error'
        ? 'Nie udalo sie skopiowac'
        : 'Kliknij, aby skopiowac link'
  const handleCopyPresenterLink = async () => {
    if (!presenterUrl) {
      setCopyState('error')
      return
    }

    try {
      await navigator.clipboard.writeText(presenterUrl)
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
            <button type="button" className={styles.disconnectBtn} onClick={() => setIsDisconnectConfirmOpen(true)}>
              Rozłącz
            </button>
          </div>
        ) : null}

        <button type="button" className={styles.addBtn} onClick={onOpenModal}>
          <span className={styles.addBtnIcon}>
            <Link2 size={18} />
          </span>
          Dodaj urządzenia
        </button>
      </div>

      {isModalOpen ? (
        <DevicePairingModal
          eyebrow="Parowanie"
          title="Podłącz urządzenie prezentera"
          qrValue={presenterUrl}
          roleLabel="Tryb: prezenter"
          description="Zeskanuj kod telefonem prezentera. Na ekranie pojawi się karta hasła i czas tury."
          statusSection={
            isConnected ? (
              <div className={styles.modalStatus}>
                <span className={styles.modalStatusDot} aria-hidden="true" />
                <span className={styles.modalStatusText}>Urządzenie prezentera jest już połączone.</span>
              </div>
            ) : (
              <div className={styles.modalStatus}>
                <span className={`${styles.modalStatusDot} ${styles.modalStatusDotIdle}`} aria-hidden="true" />
                <span className={styles.modalStatusText}>Czekam na połączenie telefonu prezentera.</span>
              </div>
            )
          }
          warning={
            showLocalhostWarning ? (
              <>
                Ten QR wskazuje na localhost. Na prawdziwym telefonie otwórz hosta po adresie sieciowym albo ustaw
                `NEXT_PUBLIC_PUBLIC_ORIGIN` i `NEXT_PUBLIC_PARTYKIT_HOST`.
              </>
            ) : null
          }
          copyLabel="Kod sesji"
          displayValue={roomId.toUpperCase()}
          copyValue={presenterUrl}
          copyHint={copyHint}
          onCopy={handleCopyPresenterLink}
          copyAriaLabel="Kopiuj link prezentera"
          onOpenExternal={() => {
            if (!presenterUrl) return
            window.open(presenterUrl, '_blank', 'noopener,noreferrer')
          }}
          onClose={onCloseModal}
          footer={
            <div className={styles.modalActions}>
              <div className={styles.modalActionRow}>
                <button
                  type="button"
                  className={styles.secondaryModalBtn}
                  onClick={() => {
                    if (isConnected) {
                      setIsRegenerateConfirmOpen(true)
                      return
                    }

                    onRegenerateSessionCode()
                  }}
                >
                  Zmień kod sesji
                </button>
                <button
                  type="button"
                  className={styles.disconnectAllBtn}
                  disabled={!isConnected}
                  onClick={() => setIsDisconnectConfirmOpen(true)}
                >
                  Rozłącz urządzenie
                </button>
              </div>
              <button type="button" className={styles.closeBtn} onClick={onCloseModal}>
                Zamknij
              </button>
            </div>
          }
        />
      ) : null}

      <AlertDialog
        open={isDisconnectConfirmOpen}
        variant="danger"
        eyebrow="Urządzenie prezentera"
        title="Rozłączyć sparowany telefon?"
        description="To unieważni aktualny kod sesji i telefon prezentera będzie musiał połączyć się ponownie."
        actions={[
          {
            label: 'Anuluj',
            variant: 'secondary',
            onClick: () => setIsDisconnectConfirmOpen(false),
          },
          {
            label: 'Rozłącz urządzenie',
            variant: 'danger',
            fullWidth: true,
            onClick: () => {
              setIsDisconnectConfirmOpen(false)
              onDisconnect()
              onCloseModal()
            },
          },
        ]}
        onClose={() => setIsDisconnectConfirmOpen(false)}
        closeOnBackdrop
      />

      <AlertDialog
        open={isRegenerateConfirmOpen}
        variant="danger"
        eyebrow="Urządzenie prezentera"
        title="Zmienić kod sesji?"
        description="To unieważni aktualny kod sesji i telefon prezentera będzie musiał połączyć się ponownie."
        actions={[
          {
            label: 'Anuluj',
            variant: 'secondary',
            onClick: () => setIsRegenerateConfirmOpen(false),
          },
          {
            label: 'Zmień kod sesji',
            variant: 'danger',
            fullWidth: true,
            onClick: () => {
              setIsRegenerateConfirmOpen(false)
              onRegenerateSessionCode()
            },
          },
        ]}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        closeOnBackdrop
      />
    </>
  )
}

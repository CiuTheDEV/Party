'use client'

import { useEffect, useState } from 'react'
import { Link2 } from 'lucide-react'
import { AlertDialog, DevicePairingModal } from '@party/ui'
import { buildCaptainUrl, getPublicOrigin } from '../../runtime/shared/codenames-runtime'
import type { CodenamesTeam } from '../state'
import { getCaptainPairingSummary } from './captain-pairing-modal-state'
import styles from './CaptainPairingPanel.module.css'

type PairingModalProps = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  captainRedConnected: boolean
  captainBlueConnected: boolean
  onClose?: () => void
  showCloseButton?: boolean
  onDisconnectDevices?: () => void
  onRegenerateSessionCode?: () => void
  onExitToMenu?: () => void
}

type PanelProps = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  captainRedConnected: boolean
  captainBlueConnected: boolean
  isModalOpen: boolean
  onDisconnectDevices: () => void
  onRegenerateSessionCode: () => void
  onOpenModal: () => void
  onCloseModal: () => void
}

export function CaptainPairingModal({
  roomId,
  teams,
  captainRedConnected,
  captainBlueConnected,
  onClose,
  showCloseButton = true,
  onDisconnectDevices,
  onRegenerateSessionCode,
  onExitToMenu,
}: PairingModalProps) {
  const [captainUrl, setCaptainUrl] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')
  const [isDisconnectConfirmOpen, setIsDisconnectConfirmOpen] = useState(false)
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)

  useEffect(() => {
    const origin = getPublicOrigin()
    if (!origin) {
      setCaptainUrl('')
      return
    }

    setCaptainUrl(buildCaptainUrl(origin, roomId))
  }, [roomId, teams])

  useEffect(() => {
    if (copyState === 'idle') return

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [copyState])

  const sessionCode = roomId.toUpperCase()
  const showLocalhostWarning = captainUrl !== '' && captainUrl.includes('localhost')
  const pairingSummary = getCaptainPairingSummary(captainRedConnected, captainBlueConnected)
  const hasConnectedDevices = captainRedConnected || captainBlueConnected
  const handleOpenInNewTab = () => {
    if (!captainUrl) return
    window.open(captainUrl, '_blank', 'noopener,noreferrer')
  }
  const handleCopySessionCode = async () => {
    if (!captainUrl) {
      setCopyState('error')
      return
    }

    try {
      await navigator.clipboard.writeText(captainUrl)
      setCopyState('success')
    } catch {
      setCopyState('error')
    }
  }
  const copyHint =
    copyState === 'success'
      ? 'Skopiowano'
      : copyState === 'error'
        ? 'Nie udalo sie skopiowac'
        : 'Kliknij, aby skopiowac link'

  return (
    <>
      <DevicePairingModal
        eyebrow="Parowanie"
        title="Podłącz telefony kapitanów"
        qrValue={captainUrl}
        roleLabel="Tryb: kapitan"
        description="Zeskanuj kod telefonem kapitana. Na ekranie pojawi się wybór drużyny, a następnie klucz odpowiedzi planszy."
        warning={
          showLocalhostWarning ? (
            <>
              Ten QR wskazuje na localhost. Na prawdziwym telefonie otwórz hosta po adresie sieciowym albo ustaw
              <code>NEXT_PUBLIC_PUBLIC_ORIGIN</code> i <code>NEXT_PUBLIC_PARTYKIT_HOST</code>.
            </>
          ) : null
        }
        statusSection={
          <>
            <div className={styles.connectionList} aria-label="Status kapitanow">
              <div className={`${styles.connectionItem} ${captainRedConnected ? styles.connectionItemConnected : ''}`}>
                <span className={`${styles.connectionDot} ${styles.connectionDotRed}`} aria-hidden="true" />
                <span className={styles.connectionLabel}>Kapitan Czerwonych</span>
                <span
                  className={`${styles.connectionState} ${captainRedConnected ? styles.connectionStateConnected : styles.connectionStateDisconnected}`}
                >
                  {captainRedConnected ? 'Polaczony' : 'Niepolaczony'}
                </span>
              </div>
              <div className={`${styles.connectionItem} ${captainBlueConnected ? styles.connectionItemConnected : ''}`}>
                <span className={`${styles.connectionDot} ${styles.connectionDotBlue}`} aria-hidden="true" />
                <span className={styles.connectionLabel}>Kapitan Niebieskich</span>
                <span
                  className={`${styles.connectionState} ${captainBlueConnected ? styles.connectionStateConnected : styles.connectionStateDisconnected}`}
                >
                  {captainBlueConnected ? 'Polaczony' : 'Niepolaczony'}
                </span>
              </div>
            </div>
            <p className={styles.connectionSummary}>{pairingSummary}</p>
          </>
        }
        copyLabel="Kod sesji"
        displayValue={sessionCode}
        copyValue={captainUrl}
        copyHint={copyHint}
        onCopy={handleCopySessionCode}
        copyAriaLabel="Kopiuj link kapitana"
        onOpenExternal={handleOpenInNewTab}
        onClose={onClose ?? (() => {})}
        footer={
          showCloseButton && onClose ? (
            <div className={styles.modalActions}>
              <div className={styles.modalActionRow}>
                <button
                  type="button"
                  className={`${styles.modalActionBtn} ${styles.modalActionBtnGhost}`}
                  onClick={() => {
                    if (hasConnectedDevices) {
                      setIsRegenerateConfirmOpen(true)
                      return
                    }

                    onRegenerateSessionCode?.()
                  }}
                >
                  Zmień kod sesji
                </button>
                <button
                  type="button"
                  className={`${styles.modalActionBtn} ${styles.modalActionBtnDanger}`}
                  onClick={() => setIsDisconnectConfirmOpen(true)}
                  disabled={!hasConnectedDevices}
                >
                  Rozłącz urządzenia
                </button>
              </div>
              <button type="button" className={styles.closeBtn} onClick={onClose}>
                Zamknij
              </button>
            </div>
          ) : onExitToMenu ? (
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.modalActionBtn} ${styles.modalActionBtnDanger} ${styles.closeBtn}`}
                onClick={() => setIsExitConfirmOpen(true)}
              >
                Powrót do menu
              </button>
            </div>
          ) : null
        }
      />

      <AlertDialog
        open={isDisconnectConfirmOpen}
        variant="danger"
        eyebrow="Urządzenia kapitanów"
        title="Rozłączyć sparowane telefony?"
        description="To unieważni aktualny kod sesji i oba telefony kapitanów będą musiały połączyć się ponownie."
        actions={[
          {
            label: 'Anuluj',
            variant: 'secondary',
            onClick: () => setIsDisconnectConfirmOpen(false),
          },
          {
            label: 'Rozłącz urządzenia',
            variant: 'danger',
            fullWidth: true,
            onClick: () => {
              setIsDisconnectConfirmOpen(false)
              onDisconnectDevices?.()
            },
          },
        ]}
        onClose={() => setIsDisconnectConfirmOpen(false)}
        closeOnBackdrop
      />

      <AlertDialog
        open={isRegenerateConfirmOpen}
        variant="danger"
        eyebrow="Urządzenia kapitanów"
        title="Zmienić kod sesji?"
        description="To unieważni aktualny kod sesji i wszystkie podłączone telefony kapitanów będą musiały połączyć się ponownie."
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
              onRegenerateSessionCode?.()
            },
          },
        ]}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        closeOnBackdrop
      />

      <AlertDialog
        open={isExitConfirmOpen}
        variant="danger"
        eyebrow="Kapitan rozłączony"
        title="Wrócić do menu?"
        description="Bieżąca rozgrywka zostanie przerwana. Użyj tej opcji tylko jeśli nie chcesz czekać na ponowne połączenie kapitana."
        actions={[
          {
            label: 'Anuluj',
            variant: 'secondary',
            onClick: () => setIsExitConfirmOpen(false),
          },
          {
            label: 'Tak, wróć do menu',
            variant: 'danger',
            fullWidth: true,
            onClick: () => {
              setIsExitConfirmOpen(false)
              onExitToMenu?.()
            },
          },
        ]}
        onClose={() => setIsExitConfirmOpen(false)}
        closeOnBackdrop
      />
    </>
  )
}

export function CaptainPairingPanel({
  roomId,
  teams,
  captainRedConnected,
  captainBlueConnected,
  isModalOpen,
  onDisconnectDevices,
  onRegenerateSessionCode,
  onOpenModal,
  onCloseModal,
}: PanelProps) {
  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.label}>Urządzenia kapitanów</span>
            <p className={styles.desc}>
              Podłącz telefony kapitanów. Zobaczą klucz odpowiedzi planszy i będą śledzić odsłaniane karty.
            </p>
          </div>
        </div>

        <div className={styles.captainsRow}>
          <div className={`${styles.captainSlot} ${captainRedConnected ? styles.connected : ''}`}>
            <span className={`${styles.dot} ${captainRedConnected ? styles.dotRed : ''}`} />
            <div className={styles.captainInfo}>
              <span className={styles.captainName}>Kapitan Czerwonych</span>
              <span className={styles.captainStatus}>{captainRedConnected ? 'Połączono' : 'Niepołączono'}</span>
            </div>
          </div>

          <div className={`${styles.captainSlot} ${captainBlueConnected ? styles.connected : ''}`}>
            <span className={`${styles.dot} ${captainBlueConnected ? styles.dotBlue : ''}`} />
            <div className={styles.captainInfo}>
              <span className={styles.captainName}>Kapitan Niebieskich</span>
              <span className={styles.captainStatus}>{captainBlueConnected ? 'Połączono' : 'Niepołączono'}</span>
            </div>
          </div>
        </div>

        <button type="button" className={styles.addBtn} onClick={onOpenModal}>
          <span className={styles.addBtnIcon}>
            <Link2 size={18} />
          </span>
          Dodaj urządzenia
        </button>
      </div>

      {isModalOpen ? (
        <CaptainPairingModal
          roomId={roomId}
          teams={teams}
          captainRedConnected={captainRedConnected}
          captainBlueConnected={captainBlueConnected}
          onDisconnectDevices={onDisconnectDevices}
          onRegenerateSessionCode={onRegenerateSessionCode}
          onClose={onCloseModal}
        />
      ) : null}
    </>
  )
}

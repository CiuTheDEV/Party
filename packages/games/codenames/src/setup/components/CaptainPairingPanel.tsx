'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Link2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { buildCaptainUrl, getPublicOrigin } from '../../runtime/shared/codenames-runtime'
import type { CodenamesTeam } from '../state'
import { getCaptainPairingSummary, shouldAutoCloseCaptainPairingModal } from './captain-pairing-modal-state'
import styles from './CaptainPairingPanel.module.css'

type PairingModalProps = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  captainRedConnected: boolean
  captainBlueConnected: boolean
  onClose?: () => void
  showCloseButton?: boolean
}

type PanelProps = {
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  captainRedConnected: boolean
  captainBlueConnected: boolean
}

export function CaptainPairingModal({
  roomId,
  teams,
  captainRedConnected,
  captainBlueConnected,
  onClose,
  showCloseButton = true,
}: PairingModalProps) {
  const [captainUrl, setCaptainUrl] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const origin = getPublicOrigin()
    if (!origin) {
      setCaptainUrl('')
      return
    }

    setCaptainUrl(
      buildCaptainUrl(origin, roomId),
    )
  }, [roomId, teams])

  useEffect(() => {
    if (showCloseButton && onClose && shouldAutoCloseCaptainPairingModal(captainRedConnected, captainBlueConnected)) {
      onClose()
    }
  }, [captainRedConnected, captainBlueConnected, onClose, showCloseButton])

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
  const handleOpenInNewTab = () => {
    if (!captainUrl) return
    window.open(captainUrl, '_blank', 'noopener,noreferrer')
    window.open(captainUrl, '_blank', 'noopener,noreferrer')
  }
  const handleCopySessionCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode)
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
        : 'Kliknij, aby skopiowac'

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Parowanie kapitanów">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderCopy}>
            <span className={styles.modalEyebrow}>Parowanie</span>
            <span className={styles.modalTitle}>Podłącz telefony kapitanów</span>
          </div>
          {captainUrl || (showCloseButton && onClose) ? (
            <div className={styles.modalActions}>
              {captainUrl ? (
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label="Otwórz w nowej karcie"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink size={16} />
                </button>
              ) : null}
              {showCloseButton && onClose ? (
                <button type="button" className={styles.iconBtn} aria-label="Zamknij" onClick={onClose}>
                  <X size={16} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.modalBody}>
          <div className={styles.qrRow}>
            {captainUrl ? (
              <div className={styles.qrBox}>
                <QRCodeSVG value={captainUrl} size={140} bgColor="#17171c" fgColor="#f0f0f0" />
              </div>
            ) : null}
            <div className={styles.qrInfo}>
              <span className={styles.roleLabel}>Tryb: kapitan</span>
              <p className={styles.roleDesc}>
                Zeskanuj kod telefonem kapitana. Na ekranie pojawi się wybór drużyny, a następnie klucz odpowiedzi planszy.
              </p>
              <div className={styles.connectionList} aria-label="Status kapitanow">
                <div className={`${styles.connectionItem} ${captainRedConnected ? styles.connectionItemConnected : ''}`}>
                  <span className={`${styles.connectionDot} ${styles.connectionDotRed}`} aria-hidden="true" />
                  <span className={styles.connectionLabel}>Kapitan Czerwonych</span>
                  <span className={`${styles.connectionState} ${captainRedConnected ? styles.connectionStateConnected : styles.connectionStateDisconnected}`}>
                    {captainRedConnected ? 'Polaczony' : 'Niepolaczony'}
                  </span>
                </div>
                <div className={`${styles.connectionItem} ${captainBlueConnected ? styles.connectionItemConnected : ''}`}>
                  <span className={`${styles.connectionDot} ${styles.connectionDotBlue}`} aria-hidden="true" />
                  <span className={styles.connectionLabel}>Kapitan Niebieskich</span>
                  <span className={`${styles.connectionState} ${captainBlueConnected ? styles.connectionStateConnected : styles.connectionStateDisconnected}`}>
                    {captainBlueConnected ? 'Polaczony' : 'Niepolaczony'}
                  </span>
                </div>
              </div>
              <p className={styles.connectionSummary}>{pairingSummary}</p>
              {showLocalhostWarning ? (
                <p className={styles.warning}>
                  Ten QR wskazuje na localhost. Na prawdziwym telefonie otwórz hosta po adresie sieciowym albo ustaw
                  <code>NEXT_PUBLIC_PUBLIC_ORIGIN</code> i <code>NEXT_PUBLIC_PARTYKIT_HOST</code>.
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles.codeRow}>
            <span className={styles.codeLabel}>Kod sesji</span>
            <button type="button" className={styles.codeButton} onClick={handleCopySessionCode} aria-label="Kopiuj kod sesji">
              <span className={styles.codeValue}>{sessionCode}</span>
              <span className={styles.codeHint}>{copyHint}</span>
            </button>
          </div>
        </div>

        {showCloseButton && onClose ? (
          <div className={styles.modalFooter}>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              Zamknij
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function CaptainPairingPanel({ roomId, teams, captainRedConnected, captainBlueConnected }: PanelProps) {
  const [showModal, setShowModal] = useState(false)

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

        <button type="button" className={styles.addBtn} onClick={() => setShowModal(true)}>
          <span className={styles.addBtnIcon}>
            <Link2 size={18} />
          </span>
          Dodaj urządzenia
        </button>
      </div>

      {showModal ? (
        <CaptainPairingModal
          roomId={roomId}
          teams={teams}
          captainRedConnected={captainRedConnected}
          captainBlueConnected={captainBlueConnected}
          onClose={() => setShowModal(false)}
        />
      ) : null}
    </>
  )
}


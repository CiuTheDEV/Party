'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Smartphone, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getPresenterOrigin, isLocalPresenterOrigin } from '../runtime'
import styles from './PairingPanel.module.css'

type Props = {
  roomId: string
  isConnected: boolean
  onDisconnect: () => void
}

export function PairingPanel({ roomId, isConnected, onDisconnect }: Props) {
  const [presenterUrl, setPresenterUrl] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const origin = getPresenterOrigin()
    setPresenterUrl(origin ? `${origin}/games/charades/present?room=${roomId}` : '')
  }, [roomId])

  useEffect(() => {
    if (isConnected) {
      setShowModal(false)
    }
  }, [isConnected])

  const sessionCode = roomId.slice(0, 6).toUpperCase()
  const showLocalhostWarning = presenterUrl !== '' && isLocalPresenterOrigin(presenterUrl)

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.label}>DODATKOWE URZĄDZENIA</span>
            <p className={styles.desc}>
              Podłącz telefon prezentera. Zobaczy hasło i odliczanie czasu.
            </p>
          </div>
          <span className={`${styles.badge} ${isConnected ? styles.badgeConnected : ''}`}>
            {isConnected ? 'Połączono' : 'Niepołączono'}
          </span>
        </div>

        {isConnected ? (
          <div className={styles.connectedRow}>
            <Smartphone size={20} className={styles.connectedIcon} />
            <span className={styles.connectedText}>Urządzenie połączone</span>
            <button type="button" className={styles.disconnectBtn} onClick={onDisconnect}>
              Rozłącz
            </button>
          </div>
        ) : (
          <button type="button" className={styles.addBtn} onClick={() => setShowModal(true)}>
            <span className={styles.addBtnIcon}>+</span>
            Dodaj urządzenia
          </button>
        )}
      </div>

      {showModal ? (
        <div className={styles.backdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Podłącz urządzenia</span>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label="Otwórz w nowej karcie"
                  onClick={() => window.open(presenterUrl, '_blank')}
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label="Zamknij"
                  onClick={() => setShowModal(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.qrRow}>
                {presenterUrl ? (
                  <div className={styles.qrBox}>
                    <QRCodeSVG value={presenterUrl} size={140} bgColor="#1a1a1a" fgColor="#f0f0f0" />
                  </div>
                ) : null}
                <div className={styles.qrInfo}>
                  <span className={styles.roleLabel}>TRYB: PREZENTER</span>
                  <p className={styles.roleDesc}>
                    Zeskanuj telefonem prezentera. Zobaczy hasło do odegrania i odliczanie czasu.
                  </p>
                  {showLocalhostWarning ? (
                    <p className={styles.warning}>
                      {'Ten QR wskazuje na localhost. Na prawdziwym telefonie otwórz hosta po adresie '}
                      {'sieciowym albo ustaw `NEXT_PUBLIC_PUBLIC_ORIGIN` i `NEXT_PUBLIC_PARTYKIT_HOST`.'}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className={styles.codeRow}>
                <span className={styles.codeLabel}>Kod sesji</span>
                <span className={styles.codeValue}>{sessionCode}</span>
              </div>
            </div>

            <div className={styles.modalFooter}>
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
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

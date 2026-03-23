'use client'

import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import {
  getPresenterOrigin,
  isLocalPresenterOrigin,
} from '../../../utils/charades-runtime'
import styles from './QRPairing.module.css'

type Props = {
  roomId: string
  isConnected: boolean
  onDisconnect: () => void
}

export function QRPairing({ roomId, isConnected, onDisconnect }: Props) {
  const [presenterUrl, setPresenterUrl] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const origin = getPresenterOrigin()
    setPresenterUrl(origin ? `${origin}/games/charades/present?room=${roomId}` : '')
  }, [roomId])

  useEffect(() => {
    if (isConnected) setShowModal(false)
  }, [isConnected])

  const sessionCode = roomId.slice(0, 6).toUpperCase()
  const showLocalhostWarning = presenterUrl !== '' && isLocalPresenterOrigin(presenterUrl)

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.label}>DODATKOWE URZADZENIA</span>
            <p className={styles.desc}>
              Podlacz telefon prezentera. Zobaczy haslo i odliczanie czasu.
            </p>
          </div>
          <span className={`${styles.badge} ${isConnected ? styles.badgeConnected : ''}`}>
            {isConnected ? 'Polaczono' : 'Niepolaczono'}
          </span>
        </div>

        {isConnected ? (
          <div className={styles.connectedRow}>
            <Smartphone size={20} className={styles.connectedIcon} />
            <span className={styles.connectedText}>Urzadzenie polaczone</span>
            <button className={styles.disconnectBtn} onClick={onDisconnect}>
              Rozlacz
            </button>
          </div>
        ) : (
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <span className={styles.addBtnIcon}>+</span>
            Dodaj urzadzenia
          </button>
        )}
      </div>

      {showModal && (
        <div className={styles.backdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Podlacz urzadzenia</span>
              <div className={styles.modalActions}>
                <button
                  className={styles.iconBtn}
                  aria-label="Otworz w nowej karcie"
                  onClick={() => window.open(presenterUrl, '_blank')}
                >
                  O
                </button>
                <button
                  className={styles.iconBtn}
                  aria-label="Zamknij"
                  onClick={() => setShowModal(false)}
                >
                  X
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.qrRow}>
                {presenterUrl && (
                  <div className={styles.qrBox}>
                    <QRCodeSVG value={presenterUrl} size={140} bgColor="#1a1a1a" fgColor="#f0f0f0" />
                  </div>
                )}
                <div className={styles.qrInfo}>
                  <span className={styles.roleLabel}>TRYB: PREZENTER</span>
                  <p className={styles.roleDesc}>
                    Zeskanuj telefonem prezentera. Zobaczy haslo do odegrania i odliczanie czasu.
                  </p>
                  {showLocalhostWarning && (
                    <p className={styles.warning}>
                      Ten QR wskazuje na localhost. Na prawdziwym telefonie otworz hosta po adresie
                      sieciowym albo ustaw NEXT_PUBLIC_PUBLIC_ORIGIN i NEXT_PUBLIC_PARTYKIT_HOST.
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.codeRow}>
                <span className={styles.codeLabel}>Kod sesji</span>
                <span className={styles.codeValue}>{sessionCode}</span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                Zamknij
              </button>
              <button
                className={styles.disconnectAllBtn}
                onClick={() => {
                  onDisconnect()
                  setShowModal(false)
                }}
              >
                Rozlacz wszystkie urzadzenia
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

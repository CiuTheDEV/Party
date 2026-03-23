'use client'

import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
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
    setPresenterUrl(`${window.location.origin}/games/charades/present?room=${roomId}`)
  }, [roomId])

  useEffect(() => {
    if (isConnected) setShowModal(false)
  }, [isConnected])

  const sessionCode = roomId.slice(0, 6).toUpperCase()

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.label}>DODATKOWE URZĄDZENIA</span>
            <p className={styles.desc}>
              Podłącz telefon prezentera — zobaczy hasło i odliczanie czasu.
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
            <button className={styles.disconnectBtn} onClick={onDisconnect}>Rozłącz</button>
          </div>
        ) : (
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <span className={styles.addBtnIcon}>⌁</span>
            Dodaj urządzenia
          </button>
        )}
      </div>

      {showModal && (
        <div className={styles.backdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Podłącz urządzenia</span>
              <div className={styles.modalActions}>
                <button className={styles.iconBtn} aria-label="Otwórz w nowej karcie"
                  onClick={() => window.open(presenterUrl, '_blank')}>⎋</button>
                <button className={styles.iconBtn} aria-label="Zamknij"
                  onClick={() => setShowModal(false)}>✕</button>
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
                    Zeskanuj telefonem prezentera — zobaczy hasło do odegrania i odliczanie czasu.
                  </p>
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
              <button className={styles.disconnectAllBtn} onClick={() => { onDisconnect(); setShowModal(false) }}>
                🔗 Rozłącz wszystkie urządzenia
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

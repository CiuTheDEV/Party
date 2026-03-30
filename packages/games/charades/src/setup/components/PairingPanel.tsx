'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Link2, Smartphone, X } from 'lucide-react'
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
        <div className={styles.backdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderCopy}>
                <span className={styles.modalEyebrow}>Parowanie</span>
                <span className={styles.modalTitle}>Podłącz urządzenie prezentera</span>
              </div>
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
                    <QRCodeSVG value={presenterUrl} size={140} bgColor="#17171c" fgColor="#f0f0f0" />
                  </div>
                ) : null}
                <div className={styles.qrInfo}>
                  <span className={styles.roleLabel}>Tryb: prezenter</span>
                  <p className={styles.roleDesc}>
                    Zeskanuj kod telefonem prezentera. Na ekranie pojawi się karta hasła i czas tury.
                  </p>
                  {showLocalhostWarning ? (
                    <p className={styles.warning}>
                      Ten QR wskazuje na localhost. Na prawdziwym telefonie otwórz hosta po adresie sieciowym albo
                      ustaw `NEXT_PUBLIC_PUBLIC_ORIGIN` i `NEXT_PUBLIC_PARTYKIT_HOST`.
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

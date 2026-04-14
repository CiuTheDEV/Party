'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Link2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getPublicOrigin } from '../../runtime/shared/codenames-runtime'
import styles from './CaptainPairingPanel.module.css'

type Props = {
  roomId: string
  captainRedConnected: boolean
  captainBlueConnected: boolean
}

export function CaptainPairingPanel({ roomId, captainRedConnected, captainBlueConnected }: Props) {
  const [captainUrl, setCaptainUrl] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const origin = getPublicOrigin()
    setCaptainUrl(origin ? `${origin}/games/codenames/captain?room=${roomId}` : '')
  }, [roomId])

  const sessionCode = roomId.slice(0, 6).toUpperCase()
  const showLocalhostWarning = captainUrl !== '' && captainUrl.includes('localhost')

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
        <div className={styles.backdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderCopy}>
                <span className={styles.modalEyebrow}>Parowanie</span>
                <span className={styles.modalTitle}>Podłącz telefony kapitanów</span>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label="Otwórz w nowej karcie"
                  onClick={() => window.open(captainUrl, '_blank')}
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
                  {showLocalhostWarning ? (
                    <p className={styles.warning}>
                      Ten QR wskazuje na localhost. Na prawdziwym telefonie otwórz hosta po adresie sieciowym albo
                      ustaw <code>NEXT_PUBLIC_PUBLIC_ORIGIN</code> i <code>NEXT_PUBLIC_PARTYKIT_HOST</code>.
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
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

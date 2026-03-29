import { ExternalLink, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getPresenterOrigin, isLocalPresenterOrigin } from '../shared/charades-runtime'
import styles from './ReconnectPresenterModal.module.css'

type Props = {
  roomId: string
  onBackToMenu: () => void
}

export function ReconnectPresenterModal({ roomId, onBackToMenu }: Props) {
  const presenterOrigin = getPresenterOrigin()
  const presenterUrl = presenterOrigin ? `${presenterOrigin}/games/charades/present?room=${roomId}` : ''
  const showLocalhostWarning = presenterUrl !== '' && isLocalPresenterOrigin(presenterUrl)
  const sessionCode = roomId.slice(0, 6).toUpperCase()

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Utracono połączenie z prezenterem</span>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Otwórz ekran prezentera w nowej karcie"
            onClick={() => window.open(presenterUrl, '_blank')}
          >
            <ExternalLink size={16} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.qrRow}>
            {presenterUrl ? (
              <div className={styles.qrBox}>
                <QRCodeSVG value={presenterUrl} size={140} bgColor="#1a1a1a" fgColor="#f0f0f0" />
              </div>
            ) : null}

            <div className={styles.info}>
              <span className={styles.eyebrow}>Gra wstrzymana</span>
              <p className={styles.description}>
                Podłącz ponownie telefon prezentera. Po odzyskaniu połączenia rozgrywka wznowi się
                od tego samego momentu.
              </p>
              <div className={styles.connectedRow}>
                <Smartphone size={18} />
                <span>Tryb: prezenter</span>
              </div>
              {showLocalhostWarning ? (
                <p className={styles.warning}>
                  Ten QR wskazuje na localhost. Na prawdziwym telefonie użyj adresu sieciowego albo
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

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={onBackToMenu}>
            Wróć do menu
          </button>
        </div>
      </div>
    </div>
  )
}

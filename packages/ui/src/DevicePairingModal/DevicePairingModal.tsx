'use client'

import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './DevicePairingModal.module.css'

export type DevicePairingModalProps = {
  eyebrow: string
  title: string
  qrValue: string | null | undefined
  roleLabel: string
  description: string
  warning?: ReactNode
  statusSection?: ReactNode
  sessionCode: string
  copyHint: string
  onCopy: () => void
  onOpenExternal?: () => void
  onClose: () => void
  footer?: ReactNode
}

export function DevicePairingModal({
  eyebrow,
  title,
  qrValue,
  roleLabel,
  description,
  warning,
  statusSection,
  sessionCode,
  copyHint,
  onCopy,
  onOpenExternal,
  onClose,
  footer,
}: DevicePairingModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          </div>
          <div className={styles.actions}>
            {onOpenExternal ? (
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Otwórz w nowej karcie"
                onClick={onOpenExternal}
              >
                <ExternalLink size={16} />
              </button>
            ) : null}
            <button ref={closeButtonRef} type="button" className={styles.iconButton} aria-label="Zamknij" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.qrRow}>
            {qrValue ? (
              <div className={styles.qrBox}>
                <QRCodeSVG value={qrValue} size={140} bgColor="#17171c" fgColor="#f0f0f0" />
              </div>
            ) : null}

            <div className={styles.info}>
              <span className={styles.roleLabel}>{roleLabel}</span>
              <p className={styles.description}>{description}</p>
              {statusSection ? <div className={styles.statusSection}>{statusSection}</div> : null}
              {warning ? <div className={styles.warning}>{warning}</div> : null}
            </div>
          </div>

          <div className={styles.codeRow}>
            <span className={styles.codeLabel}>Kod sesji</span>
            <button type="button" className={styles.codeButton} onClick={onCopy} aria-label="Kopiuj kod sesji">
              <span className={styles.codeValue}>{sessionCode}</span>
              <span className={styles.codeHint}>{copyHint}</span>
            </button>
          </div>
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  )
}

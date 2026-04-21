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
  copyLabel?: string
  displayValue?: string
  copyValue: string
  copyHint: string
  onCopy: () => void
  copyAriaLabel?: string
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
  copyLabel = 'Kod sesji',
  displayValue,
  copyValue,
  copyHint,
  onCopy,
  copyAriaLabel = 'Kopiuj kod sesji',
  onOpenExternal,
  onClose,
  footer,
}: DevicePairingModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const renderedValue = displayValue ?? copyValue
  const isLongCopyValue = renderedValue.includes('://') || renderedValue.length > 20

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

          <div className={`${styles.codeRow} ${isLongCopyValue ? styles.codeRowWide : ''}`}>
            <span className={styles.codeLabel}>{copyLabel}</span>
            <button type="button" className={styles.codeButton} onClick={onCopy} aria-label={copyAriaLabel}>
              <span className={`${styles.codeValue} ${isLongCopyValue ? styles.codeValueLong : ''}`}>{renderedValue}</span>
              <span className={styles.codeHint}>{copyHint}</span>
            </button>
          </div>
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  )
}

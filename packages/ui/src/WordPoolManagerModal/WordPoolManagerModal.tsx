import type { ReactNode } from 'react'
import styles from './WordPoolManagerModal.module.css'

export type WordPoolManagerRow = {
  name: string
  actionLabel?: string
  onAction?: () => void
  pills?: string[]
}

type WordPoolManagerModalProps = {
  closeLabel?: string
  description: string
  onClose: () => void
  open: boolean
  rows?: WordPoolManagerRow[]
  rowsDescription?: string
  rowsTitle?: string
  summaryActionLabel?: string
  summaryDescription: string
  summaryTitle: string
  summaryValue: string
  theme?: 'default' | 'game'
  title: string
  onSummaryAction?: () => void
  footer?: ReactNode
}

export function WordPoolManagerModal({
  closeLabel = 'Zamknij',
  description,
  footer = null,
  onClose,
  open,
  onSummaryAction,
  rows = [],
  rowsDescription,
  rowsTitle,
  summaryActionLabel,
  summaryDescription,
  summaryTitle,
  summaryValue,
  theme = 'default',
  title,
}: WordPoolManagerModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={`${styles.modal} ${theme === 'game' ? styles.modalGameTheme : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-pool-manager-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.heading}>
            <h3 id="word-pool-manager-title" className={styles.title}>
              {title}
            </h3>
            <p className={styles.description}>{description}</p>
          </div>
          <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
            {closeLabel}
          </button>
        </div>

        <section className={`${styles.section} ${styles.sectionSummary}`}>
          <div className={styles.sectionCopy}>
            <h4 className={styles.sectionTitle}>{summaryTitle}</h4>
            <p className={styles.sectionDescription}>{summaryDescription}</p>
            <div className={styles.summaryValue}>{summaryValue}</div>
          </div>
          {summaryActionLabel && onSummaryAction ? (
            <button type="button" className={styles.summaryAction} onClick={onSummaryAction}>
              {summaryActionLabel}
            </button>
          ) : null}
        </section>

        {rowsTitle || rowsDescription || rows.length > 0 ? (
          <section className={`${styles.section} ${styles.sectionColumn}`}>
            {rowsTitle || rowsDescription ? (
              <div className={styles.sectionCopy}>
                {rowsTitle ? <h4 className={styles.sectionTitle}>{rowsTitle}</h4> : null}
                {rowsDescription ? <p className={styles.sectionDescription}>{rowsDescription}</p> : null}
              </div>
            ) : null}

            {rows.length > 0 ? (
              <div className={styles.rowList}>
                {rows.map((row) => (
                  <div key={row.name} className={styles.row}>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowName}>{row.name}</span>
                      {row.pills && row.pills.length > 0 ? (
                        <div className={styles.rowPills}>
                          {row.pills.map((pill) => (
                            <span key={pill} className={styles.rowPill}>
                              {pill}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {row.actionLabel && row.onAction ? (
                      <button type="button" className={styles.rowAction} onClick={row.onAction}>
                        {row.actionLabel}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {footer}
          </section>
        ) : footer ? (
          <section className={`${styles.section} ${styles.sectionColumn}`}>
            {footer}
          </section>
        ) : null}
      </div>
    </div>
  )
}

'use client'

import type { ReactNode } from 'react'
import styles from './AlertDialog.module.css'

type AlertDialogAction = {
  label: string
  hintLabel?: string | null
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
}

type AlertDialogProps = {
  open: boolean
  title: string
  description: string
  eyebrow?: string
  icon?: ReactNode
  variant?: 'warning' | 'danger'
  actions: AlertDialogAction[]
  focusedActionIndex?: number | null
  isFocusVisible?: boolean
  onClose?: () => void
  closeOnBackdrop?: boolean
}

export function AlertDialog({
  open,
  title,
  description,
  eyebrow,
  icon,
  variant = 'warning',
  actions,
  focusedActionIndex = null,
  isFocusVisible = true,
  onClose,
  closeOnBackdrop = false,
}: AlertDialogProps) {
  if (!open) {
    return null
  }

  const dialogClassName =
    variant === 'danger' ? `${styles.dialog} ${styles.dialogDanger}` : `${styles.dialog} ${styles.dialogWarning}`

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => {
        if (closeOnBackdrop) {
          onClose?.()
        }
      }}
    >
      <div
        className={dialogClassName}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="shared-alert-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          {icon ? <div className={styles.icon}>{icon}</div> : null}
          <div className={styles.body}>
            {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
            <h2 id="shared-alert-dialog-title" className={styles.title}>
              {title}
            </h2>
            <p className={styles.description}>{description}</p>
          </div>
        </div>

        <div className={styles.actions}>
          {actions.map((action, index) => {
            const actionClassName =
              action.variant === 'danger'
                ? styles.actionDanger
                : action.variant === 'primary'
                  ? styles.actionPrimary
                  : styles.actionSecondary

            return (
              <button
                key={action.label}
                type="button"
                className={[styles.actionButton, actionClassName, action.fullWidth ? styles.actionFullWidth : '']
                  .concat(isFocusVisible && focusedActionIndex === index ? styles.actionFocused : '')
                  .filter(Boolean)
                  .join(' ')}
                onClick={action.onClick}
              >
                <span className={styles.actionLabel}>{action.label}</span>
                {action.hintLabel ? <span className={styles.actionHint}>{action.hintLabel}</span> : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

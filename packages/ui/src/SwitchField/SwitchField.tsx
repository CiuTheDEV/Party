'use client'

import styles from './SwitchField.module.css'

type SwitchFieldProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  ariaLabel?: string
  onLabel?: string
  offLabel?: string
}

export function SwitchField({
  checked,
  onChange,
  disabled = false,
  ariaLabel = 'Przełącznik',
  onLabel = 'ON',
  offLabel = 'OFF',
}: SwitchFieldProps) {
  return (
    <label className={styles.root}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={ariaLabel}
      />
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      <span className={styles.label}>{checked ? onLabel : offLabel}</span>
    </label>
  )
}

import styles from './SettingsStatusPill.module.css'

type SettingsStatusPillProps = {
  label: string
  variant?: 'default' | 'warning'
}

export function SettingsStatusPill({ label, variant = 'default' }: SettingsStatusPillProps) {
  return <div className={variant === 'warning' ? `${styles.pill} ${styles.pillWarning}` : styles.pill}>{label}</div>
}

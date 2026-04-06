import styles from './SettingsListHeader.module.css'

type SettingsListHeaderProps = {
  eyebrow: string
  title: string
}

export function SettingsListHeader({ eyebrow, title }: SettingsListHeaderProps) {
  return (
    <div className={styles.header}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <strong className={styles.title}>{title}</strong>
    </div>
  )
}

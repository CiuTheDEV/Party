import type { LucideIcon } from 'lucide-react'
import styles from './SettingsPlaceholderCard.module.css'

type SettingsPlaceholderCardProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function SettingsPlaceholderCard({ icon: Icon, title, description }: SettingsPlaceholderCardProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <Icon size={22} />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  )
}

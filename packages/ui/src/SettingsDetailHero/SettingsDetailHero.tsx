import type { LucideIcon } from 'lucide-react'
import styles from './SettingsDetailHero.module.css'

type SettingsDetailHeroProps = {
  icon: LucideIcon
  label: string
  title: string
}

export function SettingsDetailHero({ icon: Icon, label, title }: SettingsDetailHeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.icon}>
        <Icon size={22} />
      </div>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  )
}

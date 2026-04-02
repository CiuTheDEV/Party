import type { ReactNode } from 'react'
import styles from './GameSettingsSection.module.css'

type GameSettingsSectionProps = {
  eyebrow?: string
  title: string
  compact?: boolean
  children: ReactNode
  className?: string
}

export function GameSettingsSection({
  eyebrow,
  title,
  compact = false,
  children,
  className,
}: GameSettingsSectionProps) {
  return (
    <section className={[styles.section, compact ? styles.sectionCompact : '', className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <div className={styles.copy}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h3 className={styles.title}>{title}</h3>
        </div>
      </div>
      {children}
    </section>
  )
}

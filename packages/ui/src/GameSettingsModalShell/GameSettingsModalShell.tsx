import type { ReactNode } from 'react'
import styles from './GameSettingsModalShell.module.css'

type GameSettingsModalShellProps = {
  title: string
  sidebar: ReactNode
  children: ReactNode
  footer: ReactNode
  contentClassName?: string
}

export function GameSettingsModalShell({
  title,
  sidebar,
  children,
  footer,
  contentClassName,
}: GameSettingsModalShellProps) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.body}>
          <aside className={styles.sidebar}>{sidebar}</aside>
          <div className={[styles.content, contentClassName].filter(Boolean).join(' ')}>{children}</div>
        </div>
        <div className={styles.footer}>{footer}</div>
      </div>
    </div>
  )
}

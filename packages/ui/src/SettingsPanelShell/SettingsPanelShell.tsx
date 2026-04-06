import type { ReactNode } from 'react'
import styles from './SettingsPanelShell.module.css'

type SettingsPanelShellProps = {
  eyebrow: ReactNode
  title: string
  subtitle: string
  status?: ReactNode
  tabs: ReactNode
  main: ReactNode
  aside: ReactNode
  footer?: ReactNode
}

export function SettingsPanelShell({
  eyebrow,
  title,
  subtitle,
  status,
  tabs,
  main,
  aside,
  footer,
}: SettingsPanelShellProps) {
  return (
    <section className={styles.panel} aria-labelledby="settings-panel-title">
      <div className={styles.topbar}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <div className={styles.titleRow}>
            <h2 id="settings-panel-title" className={styles.title}>
              {title}
            </h2>
            {status ? <div className={styles.statusSlot}>{status}</div> : null}
          </div>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.tabs}>{tabs}</div>

      <div className={styles.contentGrid}>
        <div className={styles.main}>{main}</div>
        <aside className={styles.aside}>{aside}</aside>
      </div>

      {footer}
    </section>
  )
}

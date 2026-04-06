import type { ReactNode } from 'react'
import styles from './SettingsPanelFooter.module.css'

type SettingsPanelFooterProps = {
  meta: ReactNode
  actions: ReactNode
}

export function SettingsPanelFooter({ meta, actions }: SettingsPanelFooterProps) {
  return (
    <div className={styles.footer}>
      <div className={styles.meta}>{meta}</div>
      <div className={styles.actions}>{actions}</div>
    </div>
  )
}

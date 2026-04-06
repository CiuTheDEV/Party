import type { LucideIcon } from 'lucide-react'
import styles from './SettingsPanelTabs.module.css'

export type SettingsPanelTabItem<T extends string> = {
  id: T
  label: string
  icon: LucideIcon
}

type SettingsPanelTabsProps<T extends string> = {
  items: SettingsPanelTabItem<T>[]
  activeTab: T
  onChange: (tab: T) => void
  ariaLabel: string
}

export function SettingsPanelTabs<T extends string>({
  items,
  activeTab,
  onChange,
  ariaLabel,
}: SettingsPanelTabsProps<T>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeTab

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => onChange(item.id)}
          >
            <Icon size={18} />
            <span className={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

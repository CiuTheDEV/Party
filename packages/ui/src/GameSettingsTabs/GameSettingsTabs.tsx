import type { LucideIcon } from 'lucide-react'
import styles from './GameSettingsTabs.module.css'

export type GameSettingsTabItem<T extends string> = {
  id: T
  label: string
  description?: string
  icon: LucideIcon
}

type GameSettingsTabsProps<T extends string> = {
  items: GameSettingsTabItem<T>[]
  activeTab: T
  onChange: (tab: T) => void
}

export function GameSettingsTabs<T extends string>({
  items,
  activeTab,
  onChange,
}: GameSettingsTabsProps<T>) {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeTab

        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
            onClick={() => onChange(item.id)}
            aria-expanded={isActive}
          >
            <Icon size={18} className={styles.icon} />
            <span className={styles.copy}>
              <span className={styles.label}>{item.label}</span>
              {item.description ? <span className={styles.description}>{item.description}</span> : null}
            </span>
          </button>
        )
      })}
    </>
  )
}

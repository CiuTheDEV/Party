import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  focusedArrow?: 'previous' | 'next' | null
  focusedTab?: T | null
  isFocusVisible?: boolean
  onPrevious?: () => void
  onNext?: () => void
  previousShortcutLabel?: string
  nextShortcutLabel?: string
}

export function SettingsPanelTabs<T extends string>({
  items,
  activeTab,
  onChange,
  ariaLabel,
  focusedArrow = null,
  focusedTab = null,
  isFocusVisible = true,
  onPrevious,
  onNext,
  previousShortcutLabel,
  nextShortcutLabel,
}: SettingsPanelTabsProps<T>) {
  return (
    <div className={styles.shell}>
      {onPrevious ? (
        <button
          type="button"
          className={[
            styles.arrowButton,
            isFocusVisible && focusedArrow === 'previous' ? styles.arrowButtonFocused : '',
          ].filter(Boolean).join(' ')}
          onClick={onPrevious}
          aria-label="Poprzednia karta"
        >
          <ChevronLeft size={18} />
          {previousShortcutLabel ? <span className={styles.arrowHint}>{previousShortcutLabel}</span> : null}
        </button>
      ) : null}

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
              className={[
                styles.tab,
                isActive ? styles.tabActive : '',
                isFocusVisible && focusedTab === item.id ? styles.tabFocused : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onChange(item.id)}
            >
              <Icon size={18} />
              <span className={styles.label}>{item.label}</span>
            </button>
          )
        })}
      </div>

      {onNext ? (
        <button
          type="button"
          className={[
            styles.arrowButton,
            isFocusVisible && focusedArrow === 'next' ? styles.arrowButtonFocused : '',
          ].filter(Boolean).join(' ')}
          onClick={onNext}
          aria-label="Nastepna karta"
        >
          <ChevronRight size={18} />
          {nextShortcutLabel ? <span className={styles.arrowHint}>{nextShortcutLabel}</span> : null}
        </button>
      ) : null}
    </div>
  )
}

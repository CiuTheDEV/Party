'use client'

import { GameIcon } from '@party/ui'
import { Info, Target, Users } from 'lucide-react'
import { CodenamesSettingsOverlay } from './CodenamesSettingsOverlay'
import type { CodenamesMenuView } from './menu-view'
import { resolveMenuModeCommand } from './menu-controls'
import { useMenuControls } from './useMenuControls'
import styles from './CodenamesMenuContent.module.css'

export type CodenamesMenuContentProps = {
  onOpenSetup: () => void
  onFocusRail?: () => void
  onWakeHostFocus?: (device?: 'keyboard' | 'controller') => void
  onSleepHostFocus?: () => void
  isHostInputAwake?: boolean
  activeView?: CodenamesMenuView
  controlsEnabled?: boolean
  isContentFocused?: boolean
  onChangeView?: (view: CodenamesMenuView) => void
  registerSettingsExitGuard?: (guard: ((view: CodenamesMenuView) => boolean) | null) => void
  onCommitViewChange?: (view: CodenamesMenuView) => void
  onSettingsModalOpenChange?: (value: boolean) => void
  onSettingsDirtyChange?: (value: boolean) => void
}

export function CodenamesMenuContent({
  onOpenSetup,
  onFocusRail,
  onWakeHostFocus,
  onSleepHostFocus,
  isHostInputAwake = false,
  activeView,
  controlsEnabled = true,
  isContentFocused = true,
  onChangeView,
  registerSettingsExitGuard,
  onCommitViewChange,
  onSettingsModalOpenChange,
  onSettingsDirtyChange,
}: CodenamesMenuContentProps) {
  const isSettingsView = activeView === 'settings'

  useMenuControls({
    enabled: controlsEnabled && !isSettingsView,
    onAction: (action) => {
      const command = resolveMenuModeCommand('play', action)

      if (!command) return

      if (command.type === 'focus-rail') {
        onFocusRail?.()
        return
      }

      if (command.type === 'open-setup') {
        onOpenSetup()
        return
      }

      onChangeView?.('settings')
    },
  })

  return (
    <main className={isSettingsView ? `${styles.page} ${styles.pageSettings}` : styles.page}>
      {isSettingsView ? null : (
        <section className={styles.hero}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconGlow} />
            <GameIcon emoji={'\uD83D\uDD75\uFE0F'} size="lg" />
          </div>
          <h1 className={styles.title}>Tajniacy</h1>
          <p className={styles.subtitle}>
            Drużynowa gra skojarzeń i dedukcji.
            <br />
            Czy Twoja drużyna odkryje wszystkich agentów?
          </p>
        </section>
      )}

      {isSettingsView ? (
        <CodenamesSettingsOverlay
          onBack={() => onChangeView?.('mode')}
          onFocusRail={onFocusRail}
          onWakeHostFocus={onWakeHostFocus}
          onSleepHostFocus={onSleepHostFocus}
          registerSettingsExitGuard={registerSettingsExitGuard}
          onCommitViewChange={onCommitViewChange ?? ((view) => onChangeView?.(view))}
          onModalOpenChange={onSettingsModalOpenChange}
          onUnsavedChangesChange={onSettingsDirtyChange}
          isHostFocused={isContentFocused}
          isHostInputAwake={isHostInputAwake}
        />
      ) : (
        <section className={styles.modeCard}>
          <div className={styles.modeHeader}>
            <h2 className={styles.modeName}>Tryb klasyczny</h2>
            <span className={styles.badge}>Zalecany</span>
          </div>
          <div className={styles.modeBody}>
            <p className={styles.modeDesc}>
              Dwie drużyny rywalizują, odkrywając hasła swoich agentów na podstawie jednos&shy;łownych wskazówek
              Mistrza Szpiegów.
            </p>
            <ul className={styles.details}>
              <li>
                <span className={styles.iconPlayers}>
                  <Users size={18} aria-hidden="true" />
                </span>
                4+ graczy, 2 drużyny
              </li>
              <li>
                <span className={styles.iconTarget}>
                  <Target size={18} aria-hidden="true" />
                </span>
                Wybierasz kategorie haseł i liczbę rund
              </li>
            </ul>
          </div>
          <button
            className={isContentFocused ? `${styles.playBtn} ${styles.controlFocused}` : styles.playBtn}
            onClick={onOpenSetup}
          >
            Zagraj teraz
          </button>
        </section>
      )}

      {isSettingsView ? null : (
        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <span className={styles.footerLink}>Zasady</span>
            <span className={styles.footerLink}>Wsparcie</span>
          </div>
          <p className={styles.infoBar}>
            <Info size={13} aria-hidden="true" />
            Pamiętaj o bezpiecznej zabawie w grupie.
          </p>
        </footer>
      )}
    </main>
  )
}

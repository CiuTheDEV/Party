import { GameIcon } from '@party/ui'
import { Info, Smartphone, Target, Users } from 'lucide-react'
import { CharadesSettingsOverlay } from './CharadesSettingsOverlay'
import type { CharadesMenuView } from './menu-view'
import styles from './CharadesMenuContent.module.css'

export type CharadesMenuContentProps = {
  onOpenSetup: () => void
  activeView?: CharadesMenuView
  onChangeView?: (view: CharadesMenuView) => void
}

export function CharadesMenuContent({ onOpenSetup, activeView, onChangeView }: CharadesMenuContentProps) {
  const isSettingsView = activeView === 'settings'

  return (
    <main className={isSettingsView ? `${styles.page} ${styles.pageSettings}` : styles.page}>
      {isSettingsView ? null : (
        <section className={styles.hero}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconGlow} />
            <GameIcon emoji={'\uD83C\uDFAD'} size="lg" />
          </div>
          <h1 className={styles.title}>Kalambury</h1>
          <p className={styles.subtitle}>
            Pokazuj hasła bez słów, tylko gestem i mimiką.
            <br />
            Sprawdź, czy Twoi znajomi Cię rozumieją.
          </p>
        </section>
      )}

      {isSettingsView ? (
        <CharadesSettingsOverlay onBack={() => onChangeView?.('mode')} />
      ) : (
        <section className={styles.modeCard}>
          <div className={styles.modeHeader}>
            <h2 className={styles.modeName}>Tryb Klasyczny</h2>
            <span className={styles.badge}>Zalecany</span>
          </div>
          <div className={styles.modeBody}>
            <p className={styles.modeDesc}>
              Każdy gracz prezentuje hasło po kolei. Gra toczy się do wybranej liczby rund. Potrzebujesz drugiego
              urządzenia dla prezentera.
            </p>
            <ul className={styles.details}>
              <li>
                <span className={styles.iconPlayers}>
                  <Users size={18} aria-hidden="true" />
                </span>
                2-8 graczy
              </li>
              <li>
                <span className={styles.iconPhone}>
                  <Smartphone size={18} aria-hidden="true" />
                </span>
                Jedno urządzenie dla prezentera (telefon)
              </li>
              <li>
                <span className={styles.iconTarget}>
                  <Target size={18} aria-hidden="true" />
                </span>
                Wybierasz kategorie słów i liczbę rund
              </li>
            </ul>
          </div>
          <button className={styles.playBtn} onClick={onOpenSetup}>
            Zagraj teraz
          </button>
        </section>
      )}

      {isSettingsView ? null : (
        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <button type="button" className={styles.footerLink} onClick={() => onChangeView?.('mode')}>
              Menu gry
            </button>
            <button type="button" className={styles.footerLink} onClick={() => onChangeView?.('settings')}>
              Ustawienia
            </button>
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

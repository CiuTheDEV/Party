import Link from 'next/link'
import { Users, Smartphone, Target, Info } from 'lucide-react'
import { GameIcon } from '@party/ui'
import styles from './page.module.css'

export default function CharadesMenuPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <GameIcon emoji="🎭" size="lg" />
        <h1 className={styles.title}>Kalambury</h1>
        <p className={styles.subtitle}>
          Pokazuj hasła bez słów — tylko gestem i mimiką.<br />
          Sprawdź, czy Twoi znajomi Cię zrozumieją!
        </p>
      </section>

      <section className={styles.modeCard}>
        <div className={styles.modeHeader}>
          <h2 className={styles.modeName}>Tryb Klasyczny</h2>
          <span className={styles.badge}>ZALECANY</span>
        </div>
        <div className={styles.modeBody}>
          <p className={styles.modeDesc}>
            Każdy gracz prezentuje hasło po kolei. Gra do wybranej liczby rund.
            Potrzebujesz drugiego urządzenia dla prezentera.
          </p>
          <ul className={styles.details}>
            <li><span className={styles.iconPlayers}><Users size={16} aria-hidden="true" /></span>2–8 graczy</li>
            <li><span className={styles.iconPhone}><Smartphone size={16} aria-hidden="true" /></span>Jedno urządzenie dla prezentera (telefon)</li>
            <li><span className={styles.iconTarget}><Target size={16} aria-hidden="true" /></span>Wybierasz kategorie słów i liczbę rund</li>
          </ul>
        </div>
        <Link href="/games/charades/config" className={styles.playBtn}>
          Zagraj Teraz ▶
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <span className={styles.footerLink}>Jak grać?</span>
          <span className={styles.footerLink}>Zasady</span>
          <span className={styles.footerLink}>Wsparcie</span>
        </div>
        <p className={styles.infoBar}>
          <Info size={13} aria-hidden="true" />
          Pamiętaj o bezpiecznej zabawie w grupie!
        </p>
      </footer>
    </main>
  )
}

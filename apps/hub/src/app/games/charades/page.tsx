import Link from 'next/link'
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
        <p className={styles.modeDesc}>
          Każdy gracz prezentuje hasło po kolei. Gra do wybranej liczby rund.
          Potrzebujesz drugiego urządzenia dla prezentera.
        </p>
        <ul className={styles.details}>
          <li>👥 2–8 graczy</li>
          <li>📱 Jedno urządzenie dla prezentera (telefon)</li>
          <li>🎯 Wybierasz kategorie słów i liczbę rund</li>
        </ul>
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
        <p className={styles.infoBar}>ℹ️ Pamiętaj o bezpiecznej zabawie w grupie!</p>
      </footer>
    </main>
  )
}

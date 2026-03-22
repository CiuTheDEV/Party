import Link from 'next/link'
import styles from './page.module.css'

export default function CharadesMenuPage() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.icon}>🎭</span>
        <h1 className={styles.title}>Kalambury</h1>
        <p className={styles.description}>
          Pokazuj hasła bez słów — tylko gestem i mimiką.
        </p>
      </div>

      <div className={styles.modeCard}>
        <h2 className={styles.modeName}>Tryb Klasyczny</h2>
        <p className={styles.modeDesc}>
          Każdy gracz prezentuje hasło po kolei. Gra do wybranej liczby rund.
          Potrzebujesz drugiego urządzenia dla prezentera.
        </p>
        <ul className={styles.details}>
          <li>2–8 graczy</li>
          <li>Jedno urządzenie dla prezentera (telefon)</li>
          <li>Wybierasz kategorie słów i liczbę rund</li>
        </ul>
        <Link href="/games/charades/config" className={styles.playBtn}>
          Zagraj
        </Link>
      </div>

      <Link href="/" className={styles.backLink}>
        ← Wróć do lobby
      </Link>
    </main>
  )
}

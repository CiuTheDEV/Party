import styles from './PlayTopBar.module.css'

export function PlayTopBar() {
  return (
    <header className={styles.bar}>
      <span className={styles.gameName}>Kalambury</span>
    </header>
  )
}

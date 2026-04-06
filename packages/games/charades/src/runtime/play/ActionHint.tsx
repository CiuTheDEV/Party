import styles from './ActionHint.module.css'

export function ActionHint({ label, muted = false }: { label: string | null | undefined; muted?: boolean }) {
  if (!label) {
    return null
  }

  return <span className={muted ? styles.hintMuted : styles.hint}>{label}</span>
}

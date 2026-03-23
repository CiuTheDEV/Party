import styles from './GameIcon.module.css'

type Props = {
  emoji: string
  size?: 'sm' | 'md' | 'lg'
}

export function GameIcon({ emoji, size = 'md' }: Props) {
  return (
    <div className={`${styles.icon} ${styles[size]}`} aria-hidden="true">
      {emoji}
    </div>
  )
}

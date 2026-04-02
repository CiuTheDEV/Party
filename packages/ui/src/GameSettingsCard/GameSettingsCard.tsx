import type { ReactNode } from 'react'
import styles from './GameSettingsCard.module.css'

type GameSettingsCardProps = {
  disabled?: boolean
  children: ReactNode
  className?: string
}

export function GameSettingsCard({ disabled = false, children, className }: GameSettingsCardProps) {
  return <div className={[styles.card, disabled ? styles.cardDisabled : '', className].filter(Boolean).join(' ')}>{children}</div>
}

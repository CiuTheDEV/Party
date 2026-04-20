import styles from './ControlHintBadge.module.css'

type ControlHintBadgeProps = {
  label: string | null | undefined
  muted?: boolean
  visible?: boolean
  inline?: boolean
}

export function ControlHintBadge({ label, muted = false, visible = true, inline = false }: ControlHintBadgeProps) {
  if (!label) {
    return null
  }

  const className = [
    styles.root,
    inline ? styles.inline : '',
    muted ? styles.muted : '',
    visible ? styles.visible : styles.hidden,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={className}>{label}</span>
}

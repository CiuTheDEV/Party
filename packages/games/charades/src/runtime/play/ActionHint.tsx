import { ControlHintBadge } from '@party/ui'

export function ActionHint({ label, muted = false }: { label: string | null | undefined; muted?: boolean }) {
  return <ControlHintBadge label={label} muted={muted} visible inline />
}

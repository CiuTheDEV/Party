'use client'

import { RuntimeSettingsModal } from '@party/ui'

export type ExitToMenuAlertFocusTarget = 'stay' | 'exit'

type Props = {
  title?: string
  copy: string
  focusedTarget: ExitToMenuAlertFocusTarget
  isFocusVisible?: boolean
  onStay: () => void
  onExit: () => void
  actionHints?: {
    confirm?: string | null
  }
}

export function ExitToMenuAlert({
  title = 'Na pewno wrócić do menu?',
  copy,
  focusedTarget,
  isFocusVisible = false,
  onStay,
  onExit,
  actionHints,
}: Props) {
  return (
    <RuntimeSettingsModal
      eyebrow="Potwierdzenie"
      title={title}
      copy={copy}
      actions={[
        {
          id: 'exit',
          label: 'Tak, wróć do menu',
          kind: 'danger',
          hintLabel: actionHints?.confirm,
          onPress: onExit,
        },
        {
          id: 'stay',
          label: 'Zostań tutaj',
          kind: 'secondary',
          hintLabel: actionHints?.confirm,
          hintMuted: true,
          onPress: onStay,
        },
      ]}
      focusedActionId={focusedTarget}
      isFocusVisible={isFocusVisible}
      ariaLabel="Potwierdzenie wyjścia do menu"
    />
  )
}

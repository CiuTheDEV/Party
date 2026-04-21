'use client'

import { RuntimeSettingsModal } from '@party/ui'

type Props = {
  focusedTarget: 'stay' | 'confirm'
  isFocusVisible?: boolean
  onStay: () => void
  onConfirm: () => void
  actionHints?: {
    confirm?: string | null
  }
}

export function IncorrectVerdictAlert({
  focusedTarget,
  isFocusVisible = false,
  onStay,
  onConfirm,
  actionHints,
}: Props) {
  return (
    <RuntimeSettingsModal
      eyebrow="Potwierdzenie"
      title="Na pewno oznaczyć jako nie zgadnięto?"
      copy="Tura zakończy się bez punktu. Użyj tej opcji tylko wtedy, gdy nikt nie odgadł hasła."
      actions={[
        {
          id: 'confirm',
          label: 'Tak, nie zgadnięto',
          kind: 'danger',
          hintLabel: actionHints?.confirm,
          onPress: onConfirm,
        },
        {
          id: 'stay',
          label: 'Wróć do wyboru',
          kind: 'secondary',
          hintLabel: actionHints?.confirm,
          hintMuted: true,
          onPress: onStay,
        },
      ]}
      focusedActionId={focusedTarget}
      isFocusVisible={isFocusVisible}
      ariaLabel="Potwierdzenie braku odgadnięcia"
    />
  )
}

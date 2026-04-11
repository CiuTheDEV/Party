export function getVisibleActionHintLabel(
  label: string | null | undefined,
  isAwake: boolean,
): string | null {
  if (!isAwake) {
    return null
  }

  return label ?? null
}

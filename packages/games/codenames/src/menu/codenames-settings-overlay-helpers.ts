type ConnectedGamepadOption = {
  index: number
  id: string
}

type GamepadDebugState = {
  connected: boolean
  id: string
  index: number | null
  buttons: number
  axes: number
  currentInput: string | null
}

const CODENAMES_SETTINGS_DIRTY_STORAGE_KEY = 'codenames:settings:dirty'

export function areConnectedGamepadOptionsEqual(left: ConnectedGamepadOption[], right: ConnectedGamepadOption[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((option, index) => option.index === right[index]?.index && option.id === right[index]?.id)
}

export function areGamepadDebugStatesEqual(left: GamepadDebugState, right: GamepadDebugState) {
  return (
    left.connected === right.connected &&
    left.id === right.id &&
    left.index === right.index &&
    left.buttons === right.buttons &&
    left.axes === right.axes &&
    left.currentInput === right.currentInput
  )
}

export function publishSettingsDirtyState(
  isDirty: boolean,
  onUnsavedChangesChange?: (value: boolean) => void,
) {
  if (typeof window !== 'undefined') {
    if (isDirty) {
      window.sessionStorage.setItem(CODENAMES_SETTINGS_DIRTY_STORAGE_KEY, '1')
    } else {
      window.sessionStorage.removeItem(CODENAMES_SETTINGS_DIRTY_STORAGE_KEY)
    }
  }

  onUnsavedChangesChange?.(isDirty)
}

export function getNextDialogActionIndex(
  current: number,
  direction: -1 | 1,
  actionCount: number,
) {
  const nextIndex = current + direction

  if (nextIndex < 0 || nextIndex >= actionCount) {
    return current
  }

  return nextIndex
}

export type { ConnectedGamepadOption, GamepadDebugState }

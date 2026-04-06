export type HostControlDevice = 'keyboard' | 'controller'

export type HostControlAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'back'
  | 'menu'
  | 'primary'
  | 'secondary'
  | 'rail'

export type HostControlPhase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

export type HostControlsContext = {
  phase: HostControlPhase
  isRoundOrderRevealing: boolean
  isSettingsOpen: boolean
  isSettingsExitConfirmOpen: boolean
  isVerdictPickerOpen: boolean
  selectedGuessedPlayerIdx: number | null
  guessedPlayerIndexes: number[]
  isReconnectBlocking: boolean
  canToggleScoreRail: boolean
  isVerdictWordVisible: boolean
}

export type HostControlCommand =
  | { type: 'open-settings' }
  | { type: 'close-settings' }
  | { type: 'open-settings-exit-confirm' }
  | { type: 'cancel-settings-exit-confirm' }
  | { type: 'exit-to-menu' }
  | { type: 'start-round-order' }
  | { type: 'stop-round' }
  | { type: 'continue-round-summary' }
  | { type: 'open-verdict-picker' }
  | { type: 'close-verdict-picker' }
  | { type: 'select-verdict-player'; playerIdx: number }
  | { type: 'confirm-verdict-player' }
  | { type: 'give-incorrect-verdict' }
  | { type: 'toggle-score-rail' }
  | { type: 'toggle-verdict-word' }

const HOST_CONTROL_BINDING_IDS: Record<HostControlDevice, Record<HostControlAction, string>> = {
  keyboard: {
    left: 'keyboard-left',
    right: 'keyboard-right',
    up: 'keyboard-up',
    down: 'keyboard-down',
    confirm: 'keyboard-confirm',
    back: 'keyboard-back',
    menu: 'keyboard-menu',
    primary: 'keyboard-primary',
    secondary: 'keyboard-secondary',
    rail: 'keyboard-rail',
  },
  controller: {
    left: 'controller-left',
    right: 'controller-right',
    up: 'controller-up',
    down: 'controller-down',
    confirm: 'controller-confirm',
    back: 'controller-back',
    menu: 'controller-menu',
    primary: 'controller-primary',
    secondary: 'controller-secondary',
    rail: 'controller-rail',
  },
}

export function getHostControlBindingId(device: HostControlDevice, action: HostControlAction) {
  return HOST_CONTROL_BINDING_IDS[device][action]
}

export function getHostControlActionLabel(
  bindings: Record<string, string>,
  device: HostControlDevice,
  action: HostControlAction,
) {
  const bindingId = getHostControlBindingId(device, action)
  const primary = bindings[`${bindingId}:primary`] ?? ''
  const secondary = bindings[`${bindingId}:secondary`] ?? ''
  const labels = [primary, secondary].filter(Boolean)

  return labels.length > 0 ? labels.join(' / ') : null
}

export function resolveHostControlAction(
  bindings: Record<string, string>,
  device: HostControlDevice,
  inputLabel: string,
): HostControlAction | null {
  const normalizedInput = inputLabel.trim()
  const deviceBindings = HOST_CONTROL_BINDING_IDS[device]

  for (const [action, bindingId] of Object.entries(deviceBindings) as Array<[HostControlAction, string]>) {
    const labels = [bindings[`${bindingId}:primary`] ?? '', bindings[`${bindingId}:secondary`] ?? '']
    if (labels.some((label) => label.trim() === normalizedInput)) {
      return action
    }
  }

  return null
}

export function resolveHostControlCommand(
  context: HostControlsContext,
  action: HostControlAction,
): HostControlCommand | null {
  if (context.isSettingsOpen) {
    return resolveSettingsCommand(context, action)
  }

  if (context.isReconnectBlocking) {
    return null
  }

  if (context.isVerdictPickerOpen) {
    return resolveVerdictPickerCommand(context, action)
  }

  if (action === 'menu') {
    return { type: 'open-settings' }
  }

  if (context.phase === 'round-order') {
    if (!context.isRoundOrderRevealing && (action === 'primary' || action === 'confirm')) {
      return { type: 'start-round-order' }
    }

    return null
  }

  if (context.phase === 'prepare') {
    if (action === 'rail' && context.canToggleScoreRail) {
      return { type: 'toggle-score-rail' }
    }

    return null
  }

  if (context.phase === 'timer-running') {
    if (action === 'primary' || action === 'confirm') {
      return { type: 'stop-round' }
    }

    return null
  }

  if (context.phase === 'round-summary') {
    if (action === 'primary' || action === 'confirm') {
      return { type: 'continue-round-summary' }
    }

    if (action === 'secondary' || action === 'back') {
      return { type: 'exit-to-menu' }
    }

    return null
  }

  if (context.phase === 'verdict') {
    if (action === 'rail') {
      return { type: 'toggle-verdict-word' }
    }

    if (action === 'secondary' || action === 'back') {
      return { type: 'give-incorrect-verdict' }
    }

    if ((action === 'primary' || action === 'confirm') && context.guessedPlayerIndexes.length > 0) {
      return { type: 'open-verdict-picker' }
    }
  }

  return null
}

function resolveSettingsCommand(
  context: HostControlsContext,
  action: HostControlAction,
): HostControlCommand | null {
  if (context.isSettingsExitConfirmOpen) {
    if (action === 'primary' || action === 'confirm') {
      return { type: 'exit-to-menu' }
    }

    if (action === 'secondary' || action === 'back' || action === 'menu') {
      return { type: 'cancel-settings-exit-confirm' }
    }

    return null
  }

  if (action === 'secondary') {
    return { type: 'open-settings-exit-confirm' }
  }

  if (action === 'primary' || action === 'confirm' || action === 'back' || action === 'menu') {
    return { type: 'close-settings' }
  }

  return null
}

function resolveVerdictPickerCommand(
  context: HostControlsContext,
  action: HostControlAction,
): HostControlCommand | null {
  if (action === 'secondary' || action === 'back' || action === 'menu') {
    return { type: 'close-verdict-picker' }
  }

  if (action === 'primary' || action === 'confirm') {
    return context.selectedGuessedPlayerIdx === null ? null : { type: 'confirm-verdict-player' }
  }

  if (action !== 'left' && action !== 'right' && action !== 'up' && action !== 'down') {
    return null
  }

  const direction = action === 'left' || action === 'up' ? -1 : 1
  const nextPlayerIdx = getNextVerdictPlayerIndex(
    context.guessedPlayerIndexes,
    context.selectedGuessedPlayerIdx,
    direction,
  )

  return nextPlayerIdx === null ? null : { type: 'select-verdict-player', playerIdx: nextPlayerIdx }
}

function getNextVerdictPlayerIndex(
  playerIndexes: number[],
  currentSelection: number | null,
  direction: -1 | 1,
) {
  if (playerIndexes.length === 0) {
    return null
  }

  if (currentSelection === null) {
    return direction === -1 ? playerIndexes[playerIndexes.length - 1] ?? null : playerIndexes[0] ?? null
  }

  const currentIndex = playerIndexes.indexOf(currentSelection)
  if (currentIndex < 0) {
    return direction === -1 ? playerIndexes[playerIndexes.length - 1] ?? null : playerIndexes[0] ?? null
  }

  const nextIndex = (currentIndex + direction + playerIndexes.length) % playerIndexes.length
  return playerIndexes[nextIndex] ?? null
}

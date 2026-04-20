import { getBindingValue } from '../../menu/codenames-controls-bindings'

export type HostControlAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'back'
  | 'menu'
  | 'rail'

export type HostControlDevice = 'keyboard' | 'controller'

const HOST_CONTROL_BINDING_IDS: Record<HostControlDevice, Record<HostControlAction, string>> = {
  keyboard: {
    left: 'keyboard-left',
    right: 'keyboard-right',
    up: 'keyboard-up',
    down: 'keyboard-down',
    confirm: 'keyboard-confirm',
    back: 'keyboard-back',
    menu: 'keyboard-menu',
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
    rail: 'controller-rail',
  },
}

export function getHostControlBindingId(device: HostControlDevice, action: HostControlAction) {
  return HOST_CONTROL_BINDING_IDS[device][action]
}

export function resolveRuntimeHostAction(
  bindings: Record<string, string>,
  device: HostControlDevice,
  inputLabel: string,
): HostControlAction | null {
  const normalizedInput = inputLabel.trim()

  for (const [action, bindingId] of Object.entries(HOST_CONTROL_BINDING_IDS[device]) as Array<[HostControlAction, string]>) {
    const primary = getBindingValue(bindings, bindingId, 'primary').trim()
    const secondary = getBindingValue(bindings, bindingId, 'secondary').trim()

    if (normalizedInput === primary || normalizedInput === secondary) {
      return action
    }
  }

  return null
}

export function shouldReportControllerDevice(previousSnapshot: object | null, inputLabel: string | null) {
  return previousSnapshot !== null && Boolean(inputLabel)
}

import type { HostControlAction, HostControlDevice } from '../runtime/play/host-controls'

const PREDEFINED_MENU_ACTIONS: Record<HostControlDevice, Record<string, HostControlAction>> = {
  keyboard: {
    ArrowLeft: 'left',
    'Arrow Left': 'left',
    ArrowRight: 'right',
    'Arrow Right': 'right',
    ArrowUp: 'up',
    'Arrow Up': 'up',
    ArrowDown: 'down',
    'Arrow Down': 'down',
    Enter: 'confirm',
    Escape: 'back',
    Esc: 'back',
    Tab: 'menu',
  },
  controller: {
    'D-Pad Left': 'left',
    'L Stick Left': 'left',
    'D-Pad Right': 'right',
    'L Stick Right': 'right',
    'D-Pad Up': 'up',
    'L Stick Up': 'up',
    'D-Pad Down': 'down',
    'L Stick Down': 'down',
    'A / Cross': 'confirm',
    'B / Circle': 'back',
    Start: 'menu',
    Menu: 'menu',
  },
}

const PREDEFINED_MENU_STEPS: Record<HostControlDevice, Record<string, -1 | 1>> = {
  keyboard: {
    Q: -1,
    E: 1,
  },
  controller: {
    'L1 / LB': -1,
    'R1 / RB': 1,
  },
}

export function resolvePredefinedMenuAction(device: HostControlDevice, inputLabel: string): HostControlAction | null {
  const normalizedInput = inputLabel.trim()
  return PREDEFINED_MENU_ACTIONS[device][normalizedInput] ?? null
}

export function resolvePredefinedMenuStep(device: HostControlDevice, inputLabel: string): -1 | 1 | null {
  const normalizedInput = inputLabel.trim()
  return PREDEFINED_MENU_STEPS[device][normalizedInput] ?? null
}

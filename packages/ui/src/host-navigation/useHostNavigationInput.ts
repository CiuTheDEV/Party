'use client'

import { useEffect } from 'react'
import type {
  FixedHostNavigationInputMap,
  HostInputDevice,
  HostNavigationAction,
} from './host-navigation-types'

export const DEFAULT_FIXED_HOST_NAVIGATION_INPUTS: FixedHostNavigationInputMap = {
  keyboard: {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Enter: 'confirm',
    Escape: 'back',
    Tab: 'menu',
  },
  controller: {
    'D-Pad Left': 'left',
    'D-Pad Right': 'right',
    'D-Pad Up': 'up',
    'D-Pad Down': 'down',
    'L Stick Left': 'left',
    'L Stick Right': 'right',
    'L Stick Up': 'up',
    'L Stick Down': 'down',
    'A / Cross': 'confirm',
    'B / Circle': 'back',
    Start: 'menu',
    Menu: 'menu',
  },
}

const KEYBOARD_INPUT_ALIASES: Record<string, string> = {
  'Arrow Left': 'ArrowLeft',
  'Arrow Right': 'ArrowRight',
  'Arrow Up': 'ArrowUp',
  'Arrow Down': 'ArrowDown',
  Esc: 'Escape',
}

export function resolveFixedHostNavigationAction(
  device: Exclude<HostInputDevice, 'mouse'>,
  inputLabel: string,
  inputMap: FixedHostNavigationInputMap = DEFAULT_FIXED_HOST_NAVIGATION_INPUTS,
): HostNavigationAction | null {
  const normalizedLabel =
    device === 'keyboard'
      ? KEYBOARD_INPUT_ALIASES[inputLabel] ?? inputLabel
      : inputLabel

  return inputMap[device][normalizedLabel] ?? null
}

type UseHostNavigationInputOptions = {
  enabled?: boolean
  shouldHandleKeyboardEvent?: (event: KeyboardEvent) => boolean
  onAction: (action: HostNavigationAction, input: {
    device: 'keyboard'
    inputLabel: string
  }) => void
}

export function useHostNavigationInput({
  enabled = true,
  shouldHandleKeyboardEvent,
  onAction,
}: UseHostNavigationInputOptions) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return
      }

      if (shouldHandleKeyboardEvent && !shouldHandleKeyboardEvent(event)) {
        return
      }

      const action = resolveFixedHostNavigationAction('keyboard', event.key)
      if (!action) {
        return
      }

      event.preventDefault()
      onAction(action, {
        device: 'keyboard',
        inputLabel: event.key,
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onAction, shouldHandleKeyboardEvent])
}

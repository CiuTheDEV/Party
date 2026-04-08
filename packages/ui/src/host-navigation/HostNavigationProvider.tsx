'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  HostInputDevice,
  HostNavigationFocusSnapshot,
  HostNavigationState,
  HostNavigationTransition,
} from './host-navigation-types'
import {
  applyHostNavigationAction,
  applyHostNavigationTransition,
  closeHostNavigationModal,
  createHostNavigationState,
  openHostNavigationModal,
  sleepHostNavigation,
  updateControllerWakeGuard,
  wakeHostNavigation,
} from './host-navigation-engine'

function isSameFocus(
  left: HostNavigationFocusSnapshot,
  right: HostNavigationFocusSnapshot,
) {
  return (
    left.screenId === right.screenId &&
    left.zoneId === right.zoneId &&
    left.targetId === right.targetId
  )
}

type HostNavigationContextValue = {
  state: HostNavigationState
  applyTransition: (transition: HostNavigationTransition) => void
  applyAction: (input: {
    device: Exclude<HostInputDevice, 'mouse'>
    transition: HostNavigationTransition
  }) => void
  closeModal: () => void
  openModal: (target: HostNavigationFocusSnapshot) => void
  setFocus: (target: HostNavigationFocusSnapshot) => void
  sleep: (device?: HostInputDevice) => void
  updateWakeGuard: (isNeutral: boolean) => void
  wake: (device: Exclude<HostInputDevice, 'mouse'>) => void
}

const HostNavigationContext = createContext<HostNavigationContextValue | null>(null)

type HostNavigationProviderProps = HostNavigationFocusSnapshot & {
  children: ReactNode
  initialAwake?: boolean
}

export function HostNavigationProvider({
  children,
  initialAwake = false,
  screenId,
  zoneId,
  targetId,
}: HostNavigationProviderProps) {
  const [state, setState] = useState(() =>
    createHostNavigationState({
      screenId,
      zoneId,
      targetId,
      isAwake: initialAwake,
    }),
  )

  const value = useMemo<HostNavigationContextValue>(
    () => ({
      state,
      applyTransition: (transition) => {
        setState((current) => applyHostNavigationTransition(current, transition))
      },
      applyAction: (input) => {
        setState((current) => applyHostNavigationAction(current, input))
      },
      closeModal: () => {
        setState((current) => closeHostNavigationModal(current))
      },
      openModal: (target) => {
        setState((current) => openHostNavigationModal(current, target))
      },
      setFocus: (target) => {
        setState((current) => {
          if (isSameFocus(current, target)) {
            return current
          }

          return {
            ...current,
            screenId: target.screenId,
            zoneId: target.zoneId,
            targetId: target.targetId,
          }
        })
      },
      sleep: (device = 'mouse') => {
        setState((current) => sleepHostNavigation(current, device))
      },
      updateWakeGuard: (isNeutral) => {
        setState((current) => updateControllerWakeGuard(current, isNeutral))
      },
      wake: (device) => {
        setState((current) => wakeHostNavigation(current, device))
      },
    }),
    [state],
  )

  return <HostNavigationContext.Provider value={value}>{children}</HostNavigationContext.Provider>
}

export function useHostNavigationContext() {
  const context = useContext(HostNavigationContext)

  if (!context) {
    throw new Error('useHostNavigationContext must be used within HostNavigationProvider.')
  }

  return context
}

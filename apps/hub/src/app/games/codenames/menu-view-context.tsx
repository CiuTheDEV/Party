'use client'

import { createContext, useContext } from 'react'
import type { CodenamesMenuView } from '@party/codenames'

type CodenamesMenuViewContextValue = {
  activeMenuView: CodenamesMenuView
  requestMenuViewChange: (view: CodenamesMenuView) => void
  commitMenuViewChange: (view: CodenamesMenuView) => void
  menuFocusArea: 'content' | 'rail' | null
  setMenuFocusArea: (area: 'content' | 'rail' | null) => void
  railFocusedHref: string
  setRailFocusedHref: (href: string) => void
  isRailForcedExpanded: boolean
  setIsRailForcedExpanded: (value: boolean) => void
  isMenuInputSuspended: boolean
  setIsMenuInputSuspended: (value: boolean) => void
  isControllerWakeGuardActive: boolean
  isHostInputAwake: boolean
  wakeHostInput: (device?: 'keyboard' | 'controller') => void
  sleepHostInput: () => void
  hasUnsavedSettingsChanges: boolean
  setHasUnsavedSettingsChanges: (value: boolean) => void
  registerSettingsExitGuard: (guard: ((view: CodenamesMenuView) => boolean) | null) => void
}

const CodenamesMenuViewContext = createContext<CodenamesMenuViewContextValue | null>(null)

type ProviderProps = CodenamesMenuViewContextValue & {
  children: React.ReactNode
}

export function CodenamesMenuViewProvider({
  activeMenuView,
  requestMenuViewChange,
  commitMenuViewChange,
  menuFocusArea,
  setMenuFocusArea,
  railFocusedHref,
  setRailFocusedHref,
  isRailForcedExpanded,
  setIsRailForcedExpanded,
  isMenuInputSuspended,
  setIsMenuInputSuspended,
  isControllerWakeGuardActive,
  isHostInputAwake,
  wakeHostInput,
  sleepHostInput,
  hasUnsavedSettingsChanges,
  setHasUnsavedSettingsChanges,
  registerSettingsExitGuard,
  children,
}: ProviderProps) {
  return (
    <CodenamesMenuViewContext.Provider
      value={{
        activeMenuView,
        requestMenuViewChange,
        commitMenuViewChange,
        menuFocusArea,
        setMenuFocusArea,
        railFocusedHref,
        setRailFocusedHref,
        isRailForcedExpanded,
        setIsRailForcedExpanded,
        isMenuInputSuspended,
        setIsMenuInputSuspended,
        isControllerWakeGuardActive,
        isHostInputAwake,
        wakeHostInput,
        sleepHostInput,
        hasUnsavedSettingsChanges,
        setHasUnsavedSettingsChanges,
        registerSettingsExitGuard,
      }}
    >
      {children}
    </CodenamesMenuViewContext.Provider>
  )
}

export function useCodenamesMenuView() {
  const context = useContext(CodenamesMenuViewContext)

  if (!context) {
    throw new Error('useCodenamesMenuView must be used within CodenamesMenuViewProvider')
  }

  return context
}

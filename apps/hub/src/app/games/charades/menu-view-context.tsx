'use client'

import { createContext, useContext } from 'react'
import type { CharadesMenuView } from '@party/charades'

type CharadesMenuViewContextValue = {
  activeMenuView: CharadesMenuView
  requestMenuViewChange: (view: CharadesMenuView) => void
  commitMenuViewChange: (view: CharadesMenuView) => void
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
  registerSettingsExitGuard: (guard: ((view: CharadesMenuView) => boolean) | null) => void
}

const CharadesMenuViewContext = createContext<CharadesMenuViewContextValue | null>(null)

type ProviderProps = CharadesMenuViewContextValue & {
  children: React.ReactNode
}

export function CharadesMenuViewProvider({
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
    <CharadesMenuViewContext.Provider
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
    </CharadesMenuViewContext.Provider>
  )
}

export function useCharadesMenuView() {
  const context = useContext(CharadesMenuViewContext)

  if (!context) {
    throw new Error('useCharadesMenuView must be used within CharadesMenuViewProvider')
  }

  return context
}

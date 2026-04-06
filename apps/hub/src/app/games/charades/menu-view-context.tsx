'use client'

import { createContext, useContext } from 'react'
import type { CharadesMenuView } from '@party/charades'

type CharadesMenuViewContextValue = {
  activeMenuView: CharadesMenuView
  setActiveMenuView: (view: CharadesMenuView) => void
  requestMenuViewChange: (view: CharadesMenuView) => void
  hasUnsavedSettingsChanges: boolean
  setHasUnsavedSettingsChanges: (value: boolean) => void
  isSettingsExitConfirmOpen: boolean
  cancelSettingsExitConfirm: () => void
  commitPendingMenuViewChange: () => void
}

const CharadesMenuViewContext = createContext<CharadesMenuViewContextValue | null>(null)

type ProviderProps = CharadesMenuViewContextValue & {
  children: React.ReactNode
}

export function CharadesMenuViewProvider({
  activeMenuView,
  setActiveMenuView,
  requestMenuViewChange,
  hasUnsavedSettingsChanges,
  setHasUnsavedSettingsChanges,
  isSettingsExitConfirmOpen,
  cancelSettingsExitConfirm,
  commitPendingMenuViewChange,
  children,
}: ProviderProps & Omit<CharadesMenuViewContextValue, 'activeMenuView' | 'setActiveMenuView'>) {
  return (
    <CharadesMenuViewContext.Provider
      value={{
        activeMenuView,
        setActiveMenuView,
        requestMenuViewChange,
        hasUnsavedSettingsChanges,
        setHasUnsavedSettingsChanges,
        isSettingsExitConfirmOpen,
        cancelSettingsExitConfirm,
        commitPendingMenuViewChange,
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

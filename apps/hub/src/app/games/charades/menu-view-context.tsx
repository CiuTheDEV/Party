'use client'

import { createContext, useContext } from 'react'
import type { CharadesMenuView } from '@party/charades'

type CharadesMenuViewContextValue = {
  activeMenuView: CharadesMenuView
  setActiveMenuView: (view: CharadesMenuView) => void
}

const CharadesMenuViewContext = createContext<CharadesMenuViewContextValue | null>(null)

type ProviderProps = CharadesMenuViewContextValue & {
  children: React.ReactNode
}

export function CharadesMenuViewProvider({
  activeMenuView,
  setActiveMenuView,
  children,
}: ProviderProps) {
  return (
    <CharadesMenuViewContext.Provider value={{ activeMenuView, setActiveMenuView }}>
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

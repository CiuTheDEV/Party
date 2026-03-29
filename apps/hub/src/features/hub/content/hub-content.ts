import { Gamepad2, LayoutGrid, Settings, UsersRound } from 'lucide-react'

type LibraryCard = {
  gameId?: string
  name: string
  label: string
  tone: 'mystery' | 'seconds' | 'mafia' | 'ships'
}

export const libraryCards: readonly LibraryCard[] = [
  {
    gameId: 'codenames',
    name: 'Tajniacy',
    label: 'Zagadka slowna',
    tone: 'mystery',
  },
  {
    name: '5 Sekund',
    label: 'Szybka akcja',
    tone: 'seconds',
  },
  {
    name: 'Mafia',
    label: 'Dedukcja spoleczna',
    tone: 'mafia',
  },
  {
    name: 'Statki',
    label: 'Bitwa strategiczna',
    tone: 'ships',
  },
] as const

export const railItems = [
  { label: 'Glowna', href: '#hero', icon: LayoutGrid, pinnedBottom: false },
  { label: 'Biblioteka', href: '#library', icon: Gamepad2, pinnedBottom: false },
  { label: 'Spolecznosc', href: '#showcase', icon: UsersRound, pinnedBottom: false },
  { label: 'Ustawienia', href: '#footer', icon: Settings, pinnedBottom: true },
] as const

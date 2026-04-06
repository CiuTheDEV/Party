import { Gamepad2, LayoutGrid, Settings, UsersRound } from 'lucide-react'

type LibraryCard = {
  gameId?: string
  imagePath?: string
  videoPath?: string
  name: string
  label: string
  tone: 'mystery' | 'seconds' | 'mafia' | 'ships'
}

const allLibraryCards: readonly LibraryCard[] = [
  {
    gameId: 'charades',
    name: 'Kalambury',
    label: 'Pokaż bez słów',
    imagePath: '/images/game-cards/charades-card-main.png',
    videoPath: '/videos/game-cards/charades-card-main.mp4',
    tone: 'mystery',
  },
  {
    gameId: 'codenames',
    name: 'Tajniacy',
    label: 'Zagadka słowna',
    imagePath: '/images/game-cards/codenames-card-main.png',
    videoPath: '/videos/game-cards/codenames-card-main.mp4',
    tone: 'ships',
  },
  {
    name: 'Mamy szpiega',
    label: 'Blef i dedukcja',
    imagePath: '/images/game-cards/spyfall-card-main.png',
    tone: 'mafia',
  },
  {
    name: '5 Sekund',
    label: 'Szybka akcja',
    imagePath: '/images/game-cards/five-seconds-card-main.png',
    tone: 'seconds',
  },
] as const

export const featuredLibraryCards = allLibraryCards.slice(0, 4)

export const railItems = [
  { label: 'Główna', href: '#hero', icon: LayoutGrid, pinnedBottom: false },
  { label: 'Biblioteka', href: '#library', icon: Gamepad2, pinnedBottom: false },
  { label: 'Społeczność', href: '#showcase', icon: UsersRound, pinnedBottom: false },
  { label: 'Ustawienia', href: '#footer', icon: Settings, pinnedBottom: true },
] as const

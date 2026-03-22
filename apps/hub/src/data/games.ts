export type Game = {
  id: string
  name: string
  description: string
  icon: string
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  color: string
  href: string
}

export const games: Game[] = [
  {
    id: 'charades',
    name: 'Kalambury',
    description: 'Pokazuj hasła bez słów — tylko gestem i mimiką.',
    icon: '🎭',
    minPlayers: 2,
    maxPlayers: 8,
    isPremium: false,
    color: '#7c3aed',
    href: '/games/charades',
  },
]

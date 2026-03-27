import type { GameConfig } from '@party/game-sdk'

export const config: GameConfig = {
  id: 'charades',
  name: 'Kalambury',
  description: 'Pokazuj hasła bez słów — tylko gestem i mimiką.',
  icon: '🎭',
  minPlayers: 2,
  maxPlayers: 8,
  isPremium: false,
  color: '#7c3aed',
  href: '/games/charades',
  modes: ['classic'],
  categories: ['animals', 'movies', 'sport'],
  gradient: 'linear-gradient(135deg, #3b1f7a, #7c3aed, #a78bfa)',
}

import type { GameConfig } from '@party/game-sdk'
import { CHARADES_MAX_PLAYERS, CHARADES_MIN_PLAYERS } from './setup/state'

export const config: GameConfig = {
  id: 'charades',
  name: 'Kalambury',
  description: 'Pokazuj hasła bez słów, tylko gestem i mimiką.',
  icon: '\uD83C\uDFAD',
  status: 'live',
  minPlayers: CHARADES_MIN_PLAYERS,
  maxPlayers: CHARADES_MAX_PLAYERS,
  isPremium: false,
  color: '#7c3aed',
  href: '/games/charades',
  modes: ['classic'],
  categories: ['animals', 'movies', 'sport'],
  gradient: 'linear-gradient(135deg, #3b1f7a, #7c3aed, #a78bfa)',
}

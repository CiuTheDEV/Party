import type { GameConfig } from '@party/game-sdk'

export const config: GameConfig = {
  id: 'codenames',
  name: 'Codenames',
  description: 'Druzynowa gra skojarzen i dedukcji z wlasnym przebiegiem rozgrywki.',
  icon: '\uD83D\uDD75\uFE0F',
  status: 'coming-soon',
  minPlayers: 4,
  maxPlayers: 8,
  isPremium: false,
  color: '#7c3aed',
  href: '/games/codenames',
  modes: ['teams'],
  categories: [],
  gradient: 'linear-gradient(135deg, #1a1328 0%, #3b1d63 55%, #0a0912 100%)',
}

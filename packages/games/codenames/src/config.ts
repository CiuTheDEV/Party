import type { GameConfig } from '@party/game-sdk'

export const config: GameConfig = {
  id: 'codenames',
  name: 'Tajniacy',
  description: 'Drużynowa gra skojarzeń i dedukcji.',
  icon: '\uD83D\uDD75\uFE0F',
  status: 'live',
  isPremium: false,
  color: '#7c3aed',
  href: '/games/codenames',
  minPlayers: 4,
  maxPlayers: 20,
  modes: ['classic'],
  categories: ['standard', 'plus18'],
  gradient: 'linear-gradient(135deg, #1a1328 0%, #3b1d63 55%, #0a0912 100%)',
}

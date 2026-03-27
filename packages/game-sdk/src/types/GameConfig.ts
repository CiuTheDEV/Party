export type GameConfig = {
  id: string
  name: string
  description: string
  icon: string
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  color: string
  href: string
  modes: string[]
  categories: string[]
  gradient?: string
}

export type GameShellLink = {
  label: string
  href: string
  disabled?: boolean
  icon?: string
}

export type GameShellConfig = {
  gameName: string
  gameEmoji: string
  links: GameShellLink[]
}

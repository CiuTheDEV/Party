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
}

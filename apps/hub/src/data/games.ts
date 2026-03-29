import { gameModules } from './game-modules'

export const games = gameModules.map((module) => module.config)
export const liveGames = games.filter((game) => game.status === 'live')
export const comingSoonGames = games.filter((game) => game.status === 'coming-soon')

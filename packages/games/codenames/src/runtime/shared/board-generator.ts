import type { Card, CardColor } from './codenames-events'

export type GeneratedBoard = {
  cards: Card[]
  redTotal: number
  blueTotal: number
  startingTeam: 'red' | 'blue'
}

type GenerateBoardOptions = {
  assassinCount?: number
}

function fisherYates<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateBoard(wordPool: string[], options?: GenerateBoardOptions): GeneratedBoard {
  const startingTeam: 'red' | 'blue' = Math.random() < 0.5 ? 'red' : 'blue'
  const redTotal = startingTeam === 'red' ? 9 : 8
  const blueTotal = startingTeam === 'blue' ? 9 : 8
  const assassinCount = Math.max(1, Math.min(4, Math.round(options?.assassinCount ?? 1)))
  const neutralCount = 25 - redTotal - blueTotal - assassinCount

  const shuffledWords = fisherYates(wordPool)
  const words = shuffledWords.slice(0, 25)

  const colors: CardColor[] = [
    ...Array(redTotal).fill('red'),
    ...Array(blueTotal).fill('blue'),
    ...Array(neutralCount).fill('neutral'),
    ...Array(assassinCount).fill('assassin'),
  ]

  const shuffledColors = fisherYates(colors)

  const cards: Card[] = words.map((word, i) => ({
    word,
    color: shuffledColors[i],
    revealed: false,
  }))

  return { cards, redTotal, blueTotal, startingTeam }
}

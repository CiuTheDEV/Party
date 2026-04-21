import type { CSSProperties } from 'react'
import type { CardPoint, PlayerSummary, RankedPlayer } from './playboard-types'

export function getRankedPlayers(players: PlayerSummary[]) {
  let previousScore: number | null = null
  let previousTotalGuessTimeSeconds: number | null = null
  let previousRank = 0

  return [...players]
    .sort(
      (a, b) =>
        (b.score ?? 0) - (a.score ?? 0) ||
        (a.totalGuessTimeSeconds ?? 0) - (b.totalGuessTimeSeconds ?? 0) ||
        a.name.localeCompare(b.name, 'pl'),
    )
    .map((player, index) => {
      const score = player.score ?? 0
      const totalGuessTimeSeconds = player.totalGuessTimeSeconds ?? 0
      const rank =
        previousScore !== null &&
        previousTotalGuessTimeSeconds !== null &&
        score === previousScore &&
        totalGuessTimeSeconds === previousTotalGuessTimeSeconds
          ? previousRank
          : index + 1

      previousScore = score
      previousTotalGuessTimeSeconds = totalGuessTimeSeconds
      previousRank = rank

      return { ...player, rank }
    })
}

export function getScoredPlayers(players: RankedPlayer[]) {
  return players.filter((player) => (player.score ?? 0) > 0)
}

export function toLocalPoint(rect: DOMRect, container: DOMRect): CardPoint {
  return {
    x: rect.left - container.left,
    y: rect.top - container.top,
  }
}

export function getCenterDeckCardStyle(index: number) {
  return {
    '--stack-x': `${index * 0.9}px`,
    '--stack-y': `${index * 1.1}px`,
    '--stack-rotate': `${index * 0.45}deg`,
    '--stack-z': index + 1,
  } as CSSProperties
}

export function getCornerDeckCardStyle(index: number, _total?: number) {
  return {
    '--corner-fan-x': `${index * 0.9}px`,
    '--corner-fan-y': `${index * 1.1}px`,
    '--corner-fan-rotate': `${index * 0.45}deg`,
    '--corner-z': index + 1,
  } as CSSProperties
}

export function getScoreKey(player: PlayerSummary) {
  return `${player.name}-${player.avatar}-${player.gender}`
}

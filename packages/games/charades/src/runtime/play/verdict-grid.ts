export function getVerdictGridColumnCount(playerCount: number) {
  if (playerCount >= 10) {
    return 4
  }

  if (playerCount >= 5) {
    return 3
  }

  if (playerCount >= 3) {
    return 2
  }

  return Math.max(playerCount, 1)
}

export function getVerdictGridDensity(playerCount: number) {
  if (playerCount >= 10) {
    return 'grid-12'
  }

  if (playerCount >= 5) {
    return 'grid-9'
  }

  if (playerCount >= 3) {
    return 'grid-4'
  }

  return 'default'
}

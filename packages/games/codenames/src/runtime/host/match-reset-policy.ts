export type MatchResetIntent = 'rematch' | 'exit-to-menu'

export function shouldAutoStartAfterMatchReset(intent: MatchResetIntent) {
  return intent === 'rematch'
}

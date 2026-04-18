export type HostEndScreenMode = 'round' | 'match'

export type HostEndScreenModeInput = {
  roundWinsRed: number
  roundWinsBlue: number
  roundsToWin: number
}

export function getHostEndScreenMode({ roundWinsRed, roundWinsBlue, roundsToWin }: HostEndScreenModeInput): HostEndScreenMode {
  return roundWinsRed >= roundsToWin || roundWinsBlue >= roundsToWin ? 'match' : 'round'
}

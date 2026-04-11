export function getCornerDeckCountDuringDeal(totalCards: number, dealtIndex: number) {
  return Math.max(totalCards - dealtIndex - 1, 0)
}

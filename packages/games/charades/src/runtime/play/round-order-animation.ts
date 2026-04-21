export const roundOrderAnimationProfile = {
  deal: {
    startRotation: -11,
    startScale: 0.92,
    approachRotation: -3,
    approachScale: 1.03,
    approachYOffset: -14,
    approachDuration: 0.38,
    approachEase: 'power2.out',
    settleDuration: 0.18,
    settleEase: 'back.out(1.2)',
    flipDuration: 0.28,
    flipEase: 'power2.inOut',
    flipStartDelay: 0.11,
    faceSwapDelay: 0.24,
    landedHoldDuration: 0.16,
    pauseAfterMs: 92,
    fadeDuration: 0.03,
  },
} as const

export function getRoundOrderAnimationProfile() {
  return roundOrderAnimationProfile
}

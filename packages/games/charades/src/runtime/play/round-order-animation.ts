export const roundOrderAnimationProfile = {
  collect: {
    startRotation: -4,
    endRotation: -14,
    startScale: 1.02,
    endScale: 0.94,
    duration: 0.18,
    ease: 'power1.in',
    pauseAfterMs: 18,
  },
  deal: {
    startRotation: -14,
    startScale: 0.94,
    glideRotation: -3,
    glideScale: 1.015,
    glideYOffset: -12,
    glideDuration: 0.34,
    glideEase: 'power2.out',
    settleDuration: 0.16,
    settleEase: 'back.out(1.18)',
    flipDuration: 0.3,
    flipEase: 'power2.inOut',
    flipStartDelay: 0.06,
    faceSwapDelay: 0.15,
    landedHoldDuration: 0.09,
    pauseAfterMs: 78,
    fadeDuration: 0.025,
  },
} as const

export function getRoundOrderAnimationProfile() {
  return roundOrderAnimationProfile
}

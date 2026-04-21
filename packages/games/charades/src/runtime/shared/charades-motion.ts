'use client'

import { useEffect, useState } from 'react'

export const charadesMotionProfile = {
  enter: {
    duration: 0.42,
    ease: 'power2.out',
    y: 22,
    scale: 0.97,
    stagger: 0.07,
  },
  emphasis: {
    duration: 0.2,
    ease: 'power2.out',
    scale: 1.05,
  },
  countdown: {
    pulseDuration: 0.3,
    pulseScale: 1.1,
    criticalPulseDuration: 0.22,
    criticalPulseScaleBoost: 0.12,
    warningGlow: 0.28,
    criticalGlow: 0.58,
    criticalWindowRatio: 0.18,
    criticalWindowMinSeconds: 4,
    criticalWindowMaxSeconds: 8,
    warningWindowRatio: 0.3,
    warningWindowMinSeconds: 6,
    warningWindowMaxSeconds: 12,
  },
  verdict: {
    duration: 0.28,
    ease: 'power3.out',
    y: 16,
    scale: 0.96,
    stagger: 0.045,
    focusScale: 1.05,
  },
  phaseTransition: {
    duration: 0.28,
    ease: 'power2.out',
    y: 14,
    scale: 0.982,
  },
} as const

export type TimerMotionTier = 'normal' | 'warning' | 'critical'

type ReducedMotionPreference = {
  matches: boolean
}

export function resolveReducedMotionPreference(preference?: ReducedMotionPreference | null) {
  return Boolean(preference?.matches)
}

export function readReducedMotionPreference() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return resolveReducedMotionPreference(window.matchMedia('(prefers-reduced-motion: reduce)'))
}

export function useCharadesReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(readReducedMotionPreference)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReducedMotion(resolveReducedMotionPreference(mediaQuery))
    }

    update()

    mediaQuery.addEventListener('change', update)

    return () => {
      mediaQuery.removeEventListener('change', update)
    }
  }, [])

  return reducedMotion
}

export function getTimerMotionTier(remaining: number, duration: number): TimerMotionTier {
  const safeDuration = Math.max(duration, 1)
  const criticalThreshold = Math.min(
    safeDuration,
    Math.max(
      charadesMotionProfile.countdown.criticalWindowMinSeconds,
      Math.min(
        charadesMotionProfile.countdown.criticalWindowMaxSeconds,
        Math.ceil(safeDuration * charadesMotionProfile.countdown.criticalWindowRatio),
      ),
    ),
  )
  const warningThreshold = Math.min(
    safeDuration,
    Math.max(
      criticalThreshold + 2,
      charadesMotionProfile.countdown.warningWindowMinSeconds,
      Math.min(
        charadesMotionProfile.countdown.warningWindowMaxSeconds,
        Math.ceil(safeDuration * charadesMotionProfile.countdown.warningWindowRatio),
      ),
    ),
  )

  if (remaining <= criticalThreshold) {
    return 'critical'
  }

  if (remaining <= warningThreshold) {
    return 'warning'
  }

  return 'normal'
}

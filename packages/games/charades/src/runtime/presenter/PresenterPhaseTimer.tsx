'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

import {
  charadesMotionProfile,
  getTimerMotionTier,
  useCharadesReducedMotion,
} from '../shared/charades-motion'
import phaseStyles from './PresenterPhaseShared.module.css'

type PresenterPhaseTimerProps = {
  remaining: number
  duration: number
}

export function PresenterPhaseTimer({ remaining, duration }: PresenterPhaseTimerProps) {
  const reducedMotion = useCharadesReducedMotion()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const countRef = useRef<HTMLDivElement | null>(null)
  const motionTier = getTimerMotionTier(remaining, duration)

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          autoAlpha: 0,
          y: charadesMotionProfile.enter.y,
          scale: charadesMotionProfile.enter.scale,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: charadesMotionProfile.enter.duration,
          ease: charadesMotionProfile.enter.ease,
        },
      )
    }, rootRef)

    return () => {
      ctx.revert()
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion || !heroRef.current || !cardRef.current || !countRef.current) {
      return
    }

    const heroScale = motionTier === 'critical' ? 1.04 : motionTier === 'warning' ? 1.024 : 1.01
    const cardScale = motionTier === 'critical' ? 1.018 : motionTier === 'warning' ? 1.01 : 1.004
    const countScale = motionTier === 'critical' ? 1.12 : motionTier === 'warning' ? 1.075 : 1.035
    const heroGlow =
      motionTier === 'critical'
        ? `drop-shadow(0 0 24px rgba(248, 113, 113, ${charadesMotionProfile.countdown.criticalGlow})) brightness(1.18)`
        : motionTier === 'warning'
          ? `drop-shadow(0 0 16px rgba(251, 191, 36, ${charadesMotionProfile.countdown.warningGlow})) brightness(1.1)`
          : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.08))'
    const cardGlow =
      motionTier === 'critical'
        ? 'drop-shadow(0 0 16px rgba(248, 113, 113, 0.2))'
        : motionTier === 'warning'
          ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.15))'
          : 'none'
    const countGlow =
      motionTier === 'critical'
        ? 'drop-shadow(0 0 26px rgba(248, 113, 113, 0.34))'
        : motionTier === 'warning'
          ? 'drop-shadow(0 0 18px rgba(251, 191, 36, 0.24))'
          : 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.12))'

    gsap.killTweensOf([heroRef.current, cardRef.current, countRef.current])
    gsap.fromTo(
      heroRef.current,
      {
        scale: heroScale,
        filter: heroGlow,
      },
      {
        scale: 1,
        filter: 'none',
        duration: motionTier === 'critical' ? 0.34 : charadesMotionProfile.countdown.pulseDuration,
        ease: motionTier === 'critical' ? 'back.out(1.8)' : 'power3.out',
        clearProps: 'filter,transform',
      },
    )
    gsap.fromTo(
      cardRef.current,
      {
        scale: cardScale,
        filter: cardGlow,
      },
      {
        scale: 1,
        filter: 'none',
        duration: motionTier === 'critical' ? 0.28 : 0.22,
        ease: 'power3.out',
        clearProps: 'filter,transform',
      },
    )
    gsap.fromTo(
      countRef.current,
      {
        scale: countScale,
        filter: countGlow,
        y: motionTier === 'critical' ? -4 : -2,
      },
      {
        scale: 1,
        filter: 'none',
        y: 0,
        duration: motionTier === 'critical' ? 0.34 : 0.24,
        ease: motionTier === 'critical' ? 'back.out(1.7)' : 'power3.out',
        clearProps: 'filter,transform',
      },
    )
  }, [duration, motionTier, reducedMotion, remaining])

  return (
    <div ref={rootRef} className={phaseStyles.phaseSingle}>
      <section ref={cardRef} className={phaseStyles.phaseCard} data-motion-tier={motionTier}>
        <p className={phaseStyles.phaseEyebrow}>Haslo zostalo ukryte</p>
        <div ref={heroRef} className={phaseStyles.timerHero} data-motion-tier={motionTier}>
          <h2 className={phaseStyles.phaseTitle}>Czas prezentowania rozpoczyna sie.</h2>
          <div ref={countRef} className={phaseStyles.timerCount}>{remaining}</div>
          <p className={phaseStyles.phaseLead}>Powodzenia!</p>
        </div>
      </section>
    </div>
  )
}

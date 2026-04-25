import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  charadesMotionProfile,
  getTimerMotionTier,
  useCharadesReducedMotion,
} from '../../shared/charades-motion'
import styles from '../PlayBoard.module.css'
import { PresenterCard } from '../PlayBoardCards'
import { animatePhaseEnter, type TimerRunningViewProps } from './shared'

export function TimerRunningView({
  presenter,
  timerRemaining,
  currentWord,
  currentCategory,
  settings,
  animationsEnabled = true,
}: TimerRunningViewProps) {
  const wordCount = currentWord.trim().split(/\s+/).filter(Boolean).length
  const activeHintsCount = Number(settings.hints.showCategory) + Number(settings.hints.showWordCount)
  const showHints = settings.hints.enabled && activeHintsCount > 0
  const motionTier = getTimerMotionTier(timerRemaining, settings.timerSeconds)
  const reducedMotion = useCharadesReducedMotion()
  const canPulseCountdown = animationsEnabled && !reducedMotion
  const rootRef = useRef<HTMLElement | null>(null)
  const presenterPaneRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const hintsRef = useRef<HTMLDivElement | null>(null)
  const timerWrapRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    return animatePhaseEnter({
      rootRef,
      reducedMotion,
      leadingRef: presenterPaneRef,
      heroRef,
      trailingTargets: hintsRef.current ? Array.from(hintsRef.current.children) as HTMLElement[] : [],
    })
  }, [reducedMotion])

  useEffect(() => {
    if (!canPulseCountdown || motionTier === 'normal' || !timerRef.current) {
      return
    }

    const timerScale =
      motionTier === 'critical'
        ? charadesMotionProfile.countdown.pulseScale + charadesMotionProfile.countdown.criticalPulseScaleBoost + 0.04
        : motionTier === 'warning'
          ? charadesMotionProfile.countdown.pulseScale + 0.05
          : 1.06
    const timerRecoilScale = motionTier === 'critical' ? 0.9 : motionTier === 'warning' ? 0.94 : 1
    const timerGlow =
      motionTier === 'critical'
        ? `drop-shadow(0 0 46px rgba(248, 113, 113, ${charadesMotionProfile.countdown.criticalGlow})) brightness(1.32)`
        : motionTier === 'warning'
          ? `drop-shadow(0 0 30px rgba(251, 191, 36, ${charadesMotionProfile.countdown.warningGlow})) brightness(1.18)`
          : 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.16)) brightness(1.05)'
    const heroFrameBorderColor =
      motionTier === 'critical' ? 'rgba(248, 113, 113, 0.52)' : 'rgba(251, 191, 36, 0.38)'
    const heroFrameShadow =
      motionTier === 'critical'
        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.34), 0 0 34px rgba(248, 113, 113, 0.2)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(251, 191, 36, 0.24), 0 0 24px rgba(251, 191, 36, 0.14)'
    gsap.killTweensOf([timerRef.current, heroRef.current])
    const pulseTimeline = gsap.timeline()

    if (motionTier === 'critical') {
      pulseTimeline.set(timerRef.current, {
        scale: 1,
        y: 0,
        filter: timerGlow,
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerScale + 0.03,
        y: -12,
        duration: 0.06,
        ease: 'power2.out',
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerRecoilScale,
        y: 4,
        duration: 0.08,
        ease: 'power2.in',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1.1,
        y: -5,
        duration: 0.06,
        ease: 'power2.out',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1,
        y: 0,
        filter: 'none',
        duration: 0.16,
        ease: 'back.out(2.1)',
        clearProps: 'filter,transform',
      })
    } else {
      pulseTimeline.set(timerRef.current, {
        scale: timerScale,
        y: -8,
        filter: timerGlow,
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerRecoilScale,
        y: 3,
        duration: 0.11,
        ease: 'power2.in',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1,
        y: 0,
        filter: 'none',
        duration: Math.max(0.14, charadesMotionProfile.countdown.pulseDuration - 0.04),
        ease: 'back.out(1.95)',
        clearProps: 'filter,transform',
      })
    }

    if (heroRef.current) {
      if (motionTier === 'critical') {
        pulseTimeline.set(
          heroRef.current,
          {
            borderColor: heroFrameBorderColor,
            boxShadow: heroFrameShadow,
          },
          '<'
        )
        pulseTimeline.to(heroRef.current, {
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(248, 113, 113, 0.18), 0 0 18px rgba(248, 113, 113, 0.12)',
          duration: 0.1,
          ease: 'power2.in',
        })
        pulseTimeline.to(heroRef.current, {
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.28), 0 0 26px rgba(248, 113, 113, 0.16)',
          duration: 0.08,
          ease: 'power2.out',
        })
        pulseTimeline.to(heroRef.current, {
          borderColor: 'rgba(248, 113, 113, 0.24)',
          boxShadow: 'none',
          duration: 0.16,
          ease: 'power2.out',
          clearProps: 'boxShadow',
        })
      } else {
        pulseTimeline.set(
          heroRef.current,
          {
            borderColor: heroFrameBorderColor,
            boxShadow: heroFrameShadow,
          },
          '<'
        )
        pulseTimeline.to(heroRef.current, {
          borderColor: 'rgba(251, 191, 36, 0.2)',
          boxShadow: 'none',
          duration: 0.16,
          ease: 'power2.out',
          clearProps: 'boxShadow',
        })
      }
    }
  }, [canPulseCountdown, settings.timerSeconds, timerRemaining])

  return (
    <main ref={rootRef} className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div ref={presenterPaneRef} className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.timerContent}>
            <span className={styles.eyebrow}>Prezentuj!</span>
            <div ref={heroRef} className={styles.timerHero} data-motion-tier={motionTier}>
              <h1 className={styles.timerTitle}>Czas do końca prezentowania</h1>
              <div ref={timerWrapRef} className={styles.timerPulseStage}>
                <div ref={timerRef} className={styles.timer} data-motion-tier={motionTier}>
                  {timerRemaining}
                </div>
              </div>
            </div>
            {showHints ? (
              <div ref={hintsRef} className={styles.timerHints} data-single={activeHintsCount === 1}>
                {settings.hints.showCategory ? (
                  <div className={styles.timerHintItem}>
                    <span className={styles.timerHintLabel}>Kategoria</span>
                    <span className={styles.timerHintValue}>{currentCategory || 'Brak'}</span>
                  </div>
                ) : null}
                {settings.hints.showWordCount ? (
                  <div className={styles.timerHintItem}>
                    <span className={styles.timerHintLabel}>Liczba słów</span>
                    <span className={styles.timerHintValue}>{wordCount > 0 ? wordCount : 'Brak'}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

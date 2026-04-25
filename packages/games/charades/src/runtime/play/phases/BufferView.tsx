import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  charadesMotionProfile,
  getTimerMotionTier,
  useCharadesReducedMotion,
} from '../../shared/charades-motion'
import styles from '../PlayBoard.module.css'
import { PresenterCard } from '../PlayBoardCards'
import { animatePhaseEnter, type BufferViewProps } from './shared'

export function BufferView({ presenter, bufferRemaining, animationsEnabled = true }: BufferViewProps) {
  const motionTier = getTimerMotionTier(bufferRemaining, 10)
  const reducedMotion = useCharadesReducedMotion()
  const canPulseCountdown = animationsEnabled && !reducedMotion
  const rootRef = useRef<HTMLElement | null>(null)
  const presenterPaneRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const timerWrapRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<HTMLDivElement | null>(null)
  const noteRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    return animatePhaseEnter({
      rootRef,
      reducedMotion,
      leadingRef: presenterPaneRef,
      heroRef,
      trailingRef: noteRef,
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
        ? `drop-shadow(0 0 46px rgba(248, 113, 113, ${charadesMotionProfile.countdown.criticalGlow})) brightness(1.3)`
        : motionTier === 'warning'
          ? `drop-shadow(0 0 30px rgba(251, 191, 36, ${charadesMotionProfile.countdown.warningGlow})) brightness(1.16)`
          : 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.15)) brightness(1.05)'
    const heroFrameBorderColor =
      motionTier === 'critical' ? 'rgba(248, 113, 113, 0.5)' : 'rgba(251, 191, 36, 0.36)'
    const heroFrameShadow =
      motionTier === 'critical'
        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.3), 0 0 30px rgba(248, 113, 113, 0.18)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(251, 191, 36, 0.22), 0 0 20px rgba(251, 191, 36, 0.12)'

    gsap.killTweensOf([timerRef.current, heroRef.current])
    const pulseTimeline = gsap.timeline()
    if (motionTier === 'critical') {
      pulseTimeline.set(timerRef.current, {
        scale: 1,
        y: 0,
        filter: timerGlow,
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerScale + 0.02,
        y: -10,
        duration: 0.06,
        ease: 'power2.out',
      })
      pulseTimeline.to(timerRef.current, {
        scale: timerRecoilScale,
        y: 3,
        duration: 0.08,
        ease: 'power2.in',
      })
      pulseTimeline.to(timerRef.current, {
        scale: 1.08,
        y: -4,
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
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(248, 113, 113, 0.16), 0 0 16px rgba(248, 113, 113, 0.1)',
          duration: 0.1,
          ease: 'power2.in',
        })
        pulseTimeline.to(heroRef.current, {
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 24px 42px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(248, 113, 113, 0.24), 0 0 22px rgba(248, 113, 113, 0.14)',
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
  }, [bufferRemaining, canPulseCountdown])

  return (
    <main ref={rootRef} className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div ref={presenterPaneRef} className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.bufferContent}>
            <span className={styles.eyebrow}>Zapamiętaj hasło</span>
            <div ref={heroRef} className={styles.bufferHero} data-motion-tier={motionTier}>
              <h1 className={styles.bufferTitle}>Prezenter zapoznaje się z hasłem</h1>
              <div className={styles.bufferTimerWrap}>
                <div ref={timerWrapRef} className={styles.timerPulseStage}>
                  <div ref={timerRef} className={styles.timer} data-motion-tier={motionTier}>
                    {bufferRemaining}
                  </div>
                </div>
                <span className={styles.bufferTimerLabel}>sekund do startu tury</span>
              </div>
            </div>
            <div ref={noteRef} className={styles.bufferSideNote}>
              <span className={styles.bufferSideNoteLabel}>Na planszy</span>
              <p className={styles.bufferHint}>To jest moment tylko dla prezentera. Reszta graczy czeka na start tury.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

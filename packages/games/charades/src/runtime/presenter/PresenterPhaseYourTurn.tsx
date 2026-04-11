'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Eye } from 'lucide-react'
import { gsap } from 'gsap'

import { charadesMotionProfile, useCharadesReducedMotion } from '../shared/charades-motion'
import styles from './PresenterPhaseYourTurn.module.css'

type PresenterPhaseYourTurnProps = {
  canReveal: boolean
  onRevealWord: () => boolean
}

const SUBMIT_RESET_MS = 3000

export function PresenterPhaseYourTurn({
  canReveal,
  onRevealWord,
}: PresenterPhaseYourTurnProps) {
  const isSubmittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const reducedMotion = useCharadesReducedMotion()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const hintRef = useRef<HTMLParagraphElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isSubmitting) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }, SUBMIT_RESET_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isSubmitting])

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline()

      timeline.fromTo(
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

      timeline.fromTo(
        titleRef.current,
        {
          autoAlpha: 0,
          y: 12,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
        },
        '<+0.04',
      )

      timeline.fromTo(
        iconRef.current,
        {
          autoAlpha: 0,
          scale: 0.82,
          rotate: -8,
        },
        {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 0.32,
          ease: 'back.out(1.6)',
        },
        '<+0.05',
      )

      timeline.fromTo(
        hintRef.current,
        {
          autoAlpha: 0,
          y: 10,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.22,
          ease: 'power2.out',
        },
        '<+0.02',
      )

      timeline.fromTo(
        buttonRef.current,
        {
          autoAlpha: 0,
          y: 14,
          scale: 0.95,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.26,
          ease: 'back.out(1.5)',
        },
        '<+0.08',
      )
    }, rootRef)

    return () => {
      ctx.revert()
    }
  }, [reducedMotion])

  function handleRevealWord() {
    if (!canReveal || isSubmittingRef.current) {
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)
    const sent = onRevealWord()

    if (!sent) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div ref={rootRef} className={styles.yourTurnLayout}>
      <section ref={cardRef} className={styles.readyCard}>
        <div className={styles.readyCardTop}>
          <div className={styles.metaBlock}>
            <p className={styles.hiddenWordLabel}>Karta hasla</p>
          </div>
        </div>
        <div className={styles.readyHero}>
          <h2 ref={titleRef} className={styles.readyTitle}>Twoja kolej na scene</h2>
          <span ref={iconRef} className={styles.hiddenWordIcon} aria-hidden="true">
            <Eye strokeWidth={2.2} />
          </span>
          <p ref={hintRef} className={styles.readyHint}>
            Odkryj haslo, gdy bedziesz gotowy. Potem masz 10 sekund na zapoznanie lub zmiane hasla.
          </p>
        </div>
      </section>

      <button
        ref={buttonRef}
        className={styles.readyButton}
        data-submitting={isSubmitting}
        onClick={handleRevealWord}
        disabled={!canReveal || isSubmitting}
      >
        Odkryj haslo
      </button>
    </div>
  )
}

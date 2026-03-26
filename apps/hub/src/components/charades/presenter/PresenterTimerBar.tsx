'use client'

import styles from './PresenterTimerBar.module.css'

type PresenterTimerBarProps = {
  remaining: number
  duration: number
}

export function PresenterTimerBar({ remaining, duration }: PresenterTimerBarProps) {
  const progress = getProgressPercent(remaining, duration)

  return (
    <div
      className={styles.timerBar}
      role="progressbar"
      aria-label="Pozostaly czas"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={Math.max(0, remaining)}
      aria-valuetext={`${Math.max(0, remaining)} sekund`}
    >
      <div className={styles.timerFill} style={{ width: `${progress}%` }} />
    </div>
  )
}

function getProgressPercent(remaining: number, duration: number) {
  if (duration <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, (remaining / duration) * 100))
}

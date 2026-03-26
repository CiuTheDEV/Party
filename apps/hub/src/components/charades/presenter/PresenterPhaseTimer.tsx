'use client'

import phaseStyles from './PresenterPhaseShared.module.css'

type PresenterPhaseTimerProps = {
  remaining: number
  duration: number
}

export function PresenterPhaseTimer({ remaining: _remaining, duration: _duration }: PresenterPhaseTimerProps) {
  return (
    <div className={phaseStyles.phaseSingle}>
      <section className={phaseStyles.phaseCard}>
        <p className={phaseStyles.phaseEyebrow}>Haslo zostalo ukryte</p>
        <div className={phaseStyles.timerHero}>
          <h2 className={phaseStyles.phaseTitle}>Czas prezentowania rozpoczal sie.</h2>
          <p className={phaseStyles.phaseLead}>Powodzenia!</p>
        </div>
      </section>
    </div>
  )
}

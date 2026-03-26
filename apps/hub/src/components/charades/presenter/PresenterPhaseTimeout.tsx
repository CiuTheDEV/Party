'use client'

import type { PresenterNextStep } from '../../../types/charades-events'
import phaseStyles from './PresenterPhaseShared.module.css'

type PresenterPhaseTimeoutProps = {
  nextPresenterName: string
  nextPresenterAvatar: string
  nextStep: PresenterNextStep
}

export function PresenterPhaseTimeout({
  nextPresenterName,
  nextPresenterAvatar,
  nextStep,
}: PresenterPhaseTimeoutProps) {
  const message = 'Dokonajcie werdyktu.'

  return (
    <div className={phaseStyles.phaseSingle}>
      <section className={`${phaseStyles.phaseCard} ${phaseStyles.phaseCardAlert} ${phaseStyles.timeoutCard}`}>
        <p className={phaseStyles.phaseEyebrow}>Czas minol</p>
        <div className={phaseStyles.timeoutHero}>
          <h2 className={phaseStyles.phaseTitle}>Czas dobiegl konca.</h2>
          <p className={phaseStyles.timeoutVerdict}>{message}</p>
          {nextStep === 'next-presenter' ? (
            <div className={phaseStyles.timeoutNextPresenter}>
              <p className={phaseStyles.phaseLead}>Nastepny prezenter:</p>
              <div className={phaseStyles.timeoutNextRow}>
                <span className={phaseStyles.passAvatar}>{nextPresenterAvatar}</span>
                <span className={phaseStyles.timeoutNextName}>{nextPresenterName}</span>
              </div>
            </div>
          ) : (
            <p className={phaseStyles.phaseLead}>
              {nextStep === 'round-summary' ? 'Nastepnie: podsumowanie rundy' : 'Nastepnie: final gry'}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

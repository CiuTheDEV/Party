'use client'

import phaseStyles from './PresenterPhaseShared.module.css'

export function PresenterPhaseEnded() {
  return (
    <div className={phaseStyles.phaseSingle}>
      <section className={`${phaseStyles.phaseCard} ${phaseStyles.endedCard}`}>
        <p className={phaseStyles.phaseEyebrow}>Koniec gry</p>
        <div className={phaseStyles.endedHero}>
          <span className={phaseStyles.endedKicker}>To już wszystko</span>
          <h2 className={phaseStyles.phaseTitle}>Gra się zakończyła</h2>
          <p className={phaseStyles.phaseLead}>Telefon prezentera nie jest już potrzebny.</p>
        </div>
        <div className={phaseStyles.endedFooter}>
          <p className={phaseStyles.phaseBody}>Możesz odłożyć telefon albo zamknąć ten widok.</p>
        </div>
      </section>
    </div>
  )
}

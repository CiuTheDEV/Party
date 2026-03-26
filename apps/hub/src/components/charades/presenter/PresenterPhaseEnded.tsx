'use client'

import phaseStyles from './PresenterPhaseShared.module.css'

export function PresenterPhaseEnded() {
  return (
    <div className={phaseStyles.phaseSingle}>
      <section className={`${phaseStyles.phaseCard} ${phaseStyles.endedCard}`}>
        <p className={phaseStyles.phaseEyebrow}>Koniec gry</p>
        <div className={phaseStyles.endedHero}>
          <span className={phaseStyles.endedKicker}>To juz wszystko</span>
          <h2 className={phaseStyles.phaseTitle}>Gra sie zakonczyla</h2>
          <p className={phaseStyles.phaseLead}>Telefon prezentera nie jest juz potrzebny.</p>
        </div>
        <div className={phaseStyles.endedFooter}>
          <p className={phaseStyles.phaseBody}>Mozesz odlozyc telefon albo zamknac ten widok.</p>
        </div>
      </section>
    </div>
  )
}

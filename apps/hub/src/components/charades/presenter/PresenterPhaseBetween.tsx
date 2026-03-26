'use client'

import type { PresenterNextStep } from '../../../types/charades-events'
import phaseStyles from './PresenterPhaseShared.module.css'

type PresenterPhaseBetweenProps = {
  nextPresenterName: string
  nextPresenterAvatar: string
  nextStep: PresenterNextStep
}

export function PresenterPhaseBetween({
  nextPresenterName,
  nextPresenterAvatar,
  nextStep,
}: PresenterPhaseBetweenProps) {
  const isPassingToNextPresenter = nextStep === 'next-presenter'
  const title =
    nextStep === 'next-presenter'
      ? 'Nastepny prezenter'
      : nextStep === 'round-summary'
        ? 'Poczekaj na podsumowanie rundy'
        : 'Poczekaj na ekran koncowy gry'
  const lead =
    nextStep === 'next-presenter'
      ? nextPresenterName
      : nextStep === 'round-summary'
        ? 'Ta runda dobiegla konca. Host pokazuje teraz podsumowanie.'
        : 'To byla ostatnia tura. Host zaraz pokaze final gry.'
  const body =
    nextStep === 'next-presenter'
      ? 'Ekran jest gotowy na kolejna ture. Upewnij sie tylko, ze nowy prezenter ma telefon w reku.'
      : nextStep === 'round-summary'
        ? 'Nie przekazuj juz telefonu dalej. Zaczekaj, az host zamknie podsumowanie i rozpocznie kolejna runde.'
        : 'Nie przekazuj juz telefonu dalej. Zaczekaj na finalny ekran albo powrot do lobby.'

  return (
    <div className={phaseStyles.phaseStack}>
      <section className={phaseStyles.phaseCard}>
        <p className={phaseStyles.phaseEyebrow}>Zmiana prezentera</p>
        <div className={phaseStyles.passCard}>
          {isPassingToNextPresenter ? <span className={phaseStyles.passAvatar}>{nextPresenterAvatar}</span> : null}
          <div className={phaseStyles.passMeta}>
            <h2 className={phaseStyles.phaseTitle}>{title}</h2>
            <p className={phaseStyles.phaseLead}>{lead}</p>
          </div>
        </div>
      </section>

      <section className={phaseStyles.phaseCard}>
        <p className={phaseStyles.phaseBody}>{body}</p>
      </section>
    </div>
  )
}

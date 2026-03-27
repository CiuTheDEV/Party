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
      ? 'Następny prezenter'
      : nextStep === 'round-summary'
        ? 'Poczekaj na podsumowanie rundy'
        : 'Poczekaj na ekran końcowy gry'
  const lead =
    nextStep === 'next-presenter'
      ? nextPresenterName
      : nextStep === 'round-summary'
        ? 'Ta runda dobiegła końca. Host pokazuje teraz podsumowanie.'
        : 'To była ostatnia tura. Host zaraz pokaże finał gry.'
  const body =
    nextStep === 'next-presenter'
      ? 'Ekran jest gotowy na kolejną turę. Upewnij się tylko, że nowy prezenter ma telefon w ręku.'
      : nextStep === 'round-summary'
        ? 'Nie przekazuj już telefonu dalej. Zaczekaj, aż host zamknie podsumowanie i rozpocznie kolejną rundę.'
        : 'Nie przekazuj już telefonu dalej. Zaczekaj na finalny ekran albo powrót do lobby.'

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

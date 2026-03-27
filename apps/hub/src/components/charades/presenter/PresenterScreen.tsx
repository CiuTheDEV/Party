'use client'

import { PresenterPhaseReveal } from './PresenterPhaseReveal'
import { PresenterPhaseTimer } from './PresenterPhaseTimer'
import { PresenterPhaseBetween } from './PresenterPhaseBetween'
import { PresenterPhaseEnded } from './PresenterPhaseEnded'
import { PresenterPhaseYourTurn } from './PresenterPhaseYourTurn'
import styles from './PresenterScreen.module.css'
import type { PresenterScreenProps, PresenterViewState } from './types'

export function PresenterScreen({ state, onRevealWord }: PresenterScreenProps) {
  const chrome = getPresenterChrome(state)

  return (
    <div className={styles.screen}>
      <main className={styles.frame} data-phase={state.phase}>
        <header className={styles.topBar}>
          <div className={styles.presenterBlock}>
            <span className={styles.infoLabel}>{chrome.presenterLabel}</span>
            <strong className={styles.presenterName}>{chrome.presenterName}</strong>
          </div>
          {chrome.phaseValue ? <strong className={styles.phaseCenterValue}>{chrome.phaseValue}</strong> : <div /> }
          <div className={styles.phaseBlock}>
            <span className={styles.phasePill}>{chrome.phaseLabel}</span>
            <p className={styles.phaseSummary}>{chrome.phaseSummary}</p>
          </div>
        </header>

        <section className={styles.stage}>
          {state.phase === 'waiting' && (
            <MessagePanel
              accent="Gotowe"
              title="Telefon sparowany"
              body="Host jeszcze nie rozpoczął pierwszej tury."
            />
          )}

          {state.phase === 'your-turn' && (
            <PresenterPhaseYourTurn
              canReveal={Boolean(state.word)}
              onRevealWord={onRevealWord}
            />
          )}

          {state.phase === 'reveal-buffer' && (
            <PresenterPhaseReveal
              word={state.word}
              category={state.category}
              difficulty={state.difficulty}
              revealRemaining={state.revealRemaining}
              revealDuration={state.revealDuration}
            />
          )}

          {state.phase === 'timer-running' && (
            <PresenterPhaseTimer remaining={state.timerRemaining} duration={state.timerDuration} />
          )}

          {state.phase === 'awaiting-verdict' && (
            <MessagePanel
              accent="Werdykt"
              title={getAwaitingVerdictTitle(state)}
              body={getAwaitingVerdictBody(state)}
              nextPresenter={
                state.nextStep === 'next-presenter'
                  ? {
                      avatar: state.nextPresenterAvatar,
                      name: state.nextPresenterName,
                    }
                  : undefined
              }
            />
          )}

          {state.phase === 'between' && (
            <PresenterPhaseBetween
              nextPresenterName={state.nextPresenterName}
              nextPresenterAvatar={state.nextPresenterAvatar}
              nextStep={state.nextStep}
            />
          )}

          {state.phase === 'ended' && <PresenterPhaseEnded />}
        </section>
      </main>
    </div>
  )
}

function MessagePanel({
  accent,
  title,
  body,
  nextPresenter,
}: {
  accent: string
  title: string
  body: string
  nextPresenter?: {
    avatar: string
    name: string
  }
}) {
  return (
    <div className={styles.messageCard}>
      <span className={styles.messageAccent}>{accent}</span>
      <p className={styles.messageTitle}>{title}</p>
      <p className={styles.messageBody}>{body}</p>
      {nextPresenter ? (
        <div className={styles.messageNextPresenter}>
          <p className={styles.messageNextLabel}>Następny prezenter</p>
          <div className={styles.messageNextRow}>
            <span className={styles.messageNextAvatar}>{nextPresenter.avatar}</span>
            <span className={styles.messageNextName}>{nextPresenter.name}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const PRESENTER_PHASE_CHROME: Record<
  PresenterViewState['phase'],
  {
    phaseLabel: string
    presenterLabel: string
    phaseSummary: string
    phaseValue?: (state: PresenterViewState) => string
    presenterName?: (state: PresenterViewState) => string
  }
> = {
  waiting: {
    phaseLabel: 'Oczekiwanie',
    presenterLabel: 'Stan telefonu',
    phaseSummary: 'Czekaj na start pierwszej tury.',
    presenterName: () => 'Gotowy',
  },
  'your-turn': {
    phaseLabel: 'Przygotowanie',
    presenterLabel: 'Prezentuje teraz',
    phaseSummary: 'Odkryj hasło, gdy telefon jest już tylko u Ciebie.',
  },
  'reveal-buffer': {
    phaseLabel: 'Zapamiętaj hasło',
    presenterLabel: 'Prezentuje teraz',
    phaseSummary: 'Zapamiętaj hasło zanim zniknie.',
    phaseValue: (state) => `${state.revealRemaining}s`,
  },
  'timer-running': {
    phaseLabel: 'Pokazuj',
    presenterLabel: 'Prezentuje teraz',
    phaseSummary: 'Hasło jest ukryte. Liczy się tylko gest i tempo.',
  },
  'awaiting-verdict': {
    phaseLabel: 'Werdykt',
    presenterLabel: 'Prezentował',
    phaseSummary: 'Tura jest zamknięta. Czekaj na decyzję hosta.',
  },
  between: {
    phaseLabel: 'Zmiana prezentera',
    presenterLabel: 'Telefon przejmuje',
    phaseSummary: 'Przekaż telefon dalej albo poczekaj na finalny ekran.',
    presenterName: (state) => state.nextPresenterName || 'Koniec sekwencji',
  },
  ended: {
    phaseLabel: 'Koniec gry',
    presenterLabel: 'Sesja',
    phaseSummary: 'Ta karta nie jest już potrzebna.',
    presenterName: () => 'Zakończona',
  },
}

function getPresenterChrome(state: PresenterViewState) {
  const current = PRESENTER_PHASE_CHROME[state.phase]

  return {
    ...current,
    phaseValue: current.phaseValue ? current.phaseValue(state) : undefined,
    presenterName: current.presenterName ? current.presenterName(state) : state.presenterName || 'Brak danych',
  }
}

function getAwaitingVerdictTitle(state: PresenterViewState) {
  if (state.turnEndReason === 'timeout') {
    return 'Czas dobiegł końca'
  }

  if (state.nextStep === 'round-summary') {
    return 'Czekanie na nowe losowanie kolejności'
  }

  if (state.nextStep === 'game-end') {
    return 'Gra się zakończyła'
  }

  return 'Tura zakończona'
}

function getAwaitingVerdictBody(state: PresenterViewState) {
  if (state.turnEndReason === 'timeout') {
    return state.nextStep === 'next-presenter'
      ? 'Dokonajcie werdyktu.'
      : state.nextStep === 'round-summary'
        ? 'Dokonajcie werdyktu. Następnie pojawi się nowe losowanie kolejności.'
        : 'Dokonajcie werdyktu. Następnie pojawi się finał gry.'
  }

  if (state.nextStep === 'next-presenter') {
    return 'Host wybiera werdykt dla tej rundy.'
  }

  if (state.nextStep === 'round-summary') {
    return 'Host domyka tę turę i za chwilę pokaże podsumowanie oraz nowe losowanie kolejności.'
  }

  if (state.nextStep === 'game-end') {
    return 'Host domyka ostatni werdykt. Za chwilę pojawi się finał gry.'
  }

  return 'Host wybiera werdykt dla tej rundy.'
}

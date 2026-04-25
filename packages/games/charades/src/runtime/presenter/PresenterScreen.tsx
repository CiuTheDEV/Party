'use client'

import { AvatarAsset } from '@party/ui'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { PresenterPhaseReveal } from './PresenterPhaseReveal'
import { PresenterPhaseTimer } from './PresenterPhaseTimer'
import { PresenterPhaseBetween } from './PresenterPhaseBetween'
import { PresenterPhaseEnded } from './PresenterPhaseEnded'
import { PresenterPhaseYourTurn } from './PresenterPhaseYourTurn'
import { charadesMotionProfile, useCharadesReducedMotion } from '../shared/charades-motion'
import styles from './PresenterScreen.module.css'
import type { PresenterConnectionState, PresenterScreenProps, PresenterViewState } from './types'

export function PresenterScreen({ state, connectionState, onRevealWord, onChangeWord }: PresenterScreenProps) {
  const chrome = getPresenterChrome(state)
  const reducedMotion = useCharadesReducedMotion()
  const stageRef = useRef<HTMLElement | null>(null)
  const stagePhase = getStagePhase(state.phase)

  useLayoutEffect(() => {
    if (reducedMotion || !stageRef.current) {
      return
    }

    const stageContent = stageRef.current.firstElementChild as HTMLElement | null

    if (!stageContent) {
      return
    }

    gsap.killTweensOf(stageContent)

    const tween = gsap.fromTo(
      stageContent,
      {
        autoAlpha: 0,
        y: charadesMotionProfile.phaseTransition.y,
        scale: charadesMotionProfile.phaseTransition.scale,
        filter: 'blur(10px)',
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: charadesMotionProfile.phaseTransition.duration,
        ease: charadesMotionProfile.phaseTransition.ease,
        clearProps: 'transform,opacity,visibility,filter',
      },
    )

    return () => {
      tween.kill()
      gsap.set(stageContent, { clearProps: 'transform,opacity,visibility,filter' })
    }
  }, [reducedMotion, state.phase])

  return (
    <div className={styles.screen}>
      <main className={styles.frame} data-phase={stagePhase}>
        <header className={styles.topBar}>
          <div className={styles.presenterBlock}>
            <span className={styles.infoLabel}>{chrome.presenterLabel}</span>
            <strong className={styles.presenterName}>{chrome.presenterName}</strong>
          </div>
          {chrome.phaseValue ? <strong className={styles.phaseCenterValue}>{chrome.phaseValue}</strong> : <div />}
          <div className={styles.phaseBlock}>
            <span className={styles.phasePill}>{chrome.phaseLabel}</span>
            <p className={styles.phaseSummary}>{chrome.phaseSummary}</p>
          </div>
        </header>

        <section ref={stageRef} className={styles.stage} data-phase={stagePhase}>
          {state.phase === 'waiting' && (
            <MessagePanel
              accent="Oczekiwanie"
              title="Oczekiwanie na rozpoczęcie przez hosta"
              body="Telefon jest sparowany. Zaczekaj, aż host zamknie setup i rozpocznie rundę."
            />
          )}

          {state.phase === 'host-left' && (
            <MessagePanel
              accent="Menu główne"
              title="Host wrócił do menu głównego"
              body="Ta rozgrywka została zamknięta. Zaczekaj, aż host uruchomi nową grę albo sparuj telefon ponownie."
            />
          )}

          {state.phase === 'devices-disconnected' && (
            <MessagePanel
              accent="Urządzenie rozłączone"
              title="Host rozłączył urządzenie"
              body="Ten telefon nie jest już sparowany z grą. Poczekaj, aż host połączy urządzenie ponownie."
            />
          )}

          {state.phase === 'session-code-changed' && (
            <MessagePanel
              accent="Nowy kod sesji"
              title="Host zmienił kod sesji"
              body={`Ta karta nie jest już aktywna. Dołącz ponownie z nowym kodem: ${state.nextRoomId.toUpperCase()}.`}
            />
          )}

          {state.phase === 'round-order' && (
            <MessagePanel
              accent="Losowanie"
              title="Losowana jest kolejność"
              body="Host ustala teraz kolejność prezenterów. Zaczekaj, aż pojawi się informacja, kto przejmuje telefon."
            />
          )}

          {state.phase === 'your-turn' && <PresenterPhaseYourTurn canReveal={Boolean(state.word)} onRevealWord={onRevealWord} />}

          {state.phase === 'reveal-buffer' && (
            <PresenterPhaseReveal
              word={state.word}
              category={state.category}
              difficulty={state.difficulty}
              canChangeWord={state.canChangeWord}
              remainingWordChanges={state.remainingWordChanges}
              onChangeWord={onChangeWord}
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

        {connectionState !== 'connected' ? (
          <ConnectionOverlay connectionState={connectionState} />
        ) : null}
      </main>
    </div>
  )
}

function getStagePhase(phase: PresenterViewState['phase']) {
  if (phase === 'round-order') {
    return 'decision'
  }

  if (phase === 'host-left') {
    return 'ended'
  }

  if (phase === 'devices-disconnected') {
    return 'ended'
  }

  if (phase === 'session-code-changed') {
    return 'ended'
  }

  if (phase === 'your-turn' || phase === 'reveal-buffer') {
    return 'prepare'
  }

  if (phase === 'timer-running') {
    return 'active'
  }

  if (phase === 'awaiting-verdict' || phase === 'between') {
    return 'decision'
  }

  if (phase === 'ended') {
    return 'ended'
  }

  return 'idle'
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
            <AvatarAsset avatar={nextPresenter.avatar} className={styles.messageNextAvatar} />
            <span className={styles.messageNextName}>{nextPresenter.name}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ConnectionOverlay({ connectionState }: { connectionState: PresenterConnectionState }) {
  const isRecovering = connectionState === 'reconnecting' || connectionState === 'connecting'

  return (
    <div className={styles.connectionOverlay}>
      <div className={styles.connectionCard}>
        <span className={styles.connectionEyebrow}>{isRecovering ? 'Łączenie' : 'Problem z połączeniem'}</span>
        <p className={styles.connectionTitle}>
          {isRecovering ? 'Łączę ponownie z pokojem' : 'Nie udało się utrzymać połączenia'}
        </p>
        <p className={styles.connectionBody}>
          {isRecovering
            ? 'Zachowujemy ostatni widok tury. Ekran prezentera wznowi się automatycznie po odzyskaniu połączenia.'
            : 'Odśwież ekran prezentera albo zeskanuj kod QR ponownie, jeśli problem nie zniknie po chwili.'}
        </p>
      </div>
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
    phaseSummary: 'Czekaj, aż host rozpocznie rundę.',
    presenterName: () => 'Gotowy',
  },
  'round-order': {
    phaseLabel: 'Losowanie',
    presenterLabel: 'Stan telefonu',
    phaseSummary: 'Host ustala teraz kolejność prezenterów.',
    presenterName: () => 'Czekaj',
  },
  'host-left': {
    phaseLabel: 'Menu główne',
    presenterLabel: 'Stan telefonu',
    phaseSummary: 'Host zakończył tę rozgrywkę i wrócił do menu.',
    presenterName: () => 'Odłączony od gry',
  },
  'devices-disconnected': {
    phaseLabel: 'Urządzenie rozłączone',
    presenterLabel: 'Stan telefonu',
    phaseSummary: 'Host rozłączył ten telefon. Poczekaj na ponowne sparowanie.',
    presenterName: () => 'Nie jest już sparowany',
  },
  'session-code-changed': {
    phaseLabel: 'Nowy kod sesji',
    presenterLabel: 'Stan telefonu',
    phaseSummary: 'Host zmienił kod. Sparuj telefon ponownie z nową sesją.',
    presenterName: () => 'Wymaga ponownego połączenia',
  },
  'your-turn': {
    phaseLabel: 'Przygotowanie',
    presenterLabel: 'Prezentuje teraz',
    phaseSummary: 'Odkryj hasło, gdy telefon jest już tylko u Ciebie.',
  },
  'reveal-buffer': {
    phaseLabel: 'Zapamiętaj hasło',
    presenterLabel: 'Prezentuje teraz',
    phaseSummary: 'Zapamiętaj hasło, zanim zniknie.',
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
    phaseSummary: 'Przekaż telefon dalej albo poczekaj na finałowy ekran.',
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

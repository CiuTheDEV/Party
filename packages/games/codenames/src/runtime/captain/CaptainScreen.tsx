'use client'

import { CircleAlert, KeyRound, SmartphoneNfc } from 'lucide-react'
import { AlertDialog, AvatarAsset } from '@party/ui'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptainGame } from './useCaptainGame'
import { CaptainGrid } from './CaptainGrid'
import { getCaptainScreenMode } from './screen-mode'
import { getCaptainBoardMeta } from './board-meta'
import { RoundIntroOverlay } from '../shared/RoundIntroOverlay'
import { getCaptainRuntimeStatus, shouldWarnBeforeUnload } from '../shared/runtime-status'
import styles from './CaptainScreen.module.css'

type CaptainTeam = {
  name: string
  avatar: string
}

type CaptainScreenProps = {
  roomId: string
  team: 'red' | 'blue'
  redTeam: CaptainTeam
  blueTeam: CaptainTeam
  onChangeRole: () => void
}

export function CaptainScreen({ roomId, team, redTeam, blueTeam, onChangeRole }: CaptainScreenProps) {
  const router = useRouter()
  const {
    roomState,
    hasSyncedRoomState,
    hostDisconnected,
    sessionInvalidated,
    devicesDisconnectedByHost,
    sessionCodeChangedRoomId,
    isRoundIntroVisible,
    markReady,
  } = useCaptainGame({ roomId, team })
  const [isBrowserExitAlertOpen, setIsBrowserExitAlertOpen] = useState(false)
  const screenMode = getCaptainScreenMode(roomState)
  const boardMeta = getCaptainBoardMeta(roomState)
  const resolvedRedTeam = resolveCaptainTeam(roomState.redTeam, redTeam)
  const resolvedBlueTeam = resolveCaptainTeam(roomState.blueTeam, blueTeam)

  const redTeamLabel = resolvedRedTeam.name
  const blueTeamLabel = resolvedBlueTeam.name
  const activeTeamLabel = team === 'red' ? redTeamLabel : blueTeamLabel
  const activeTeamAvatar = team === 'red' ? resolvedRedTeam.avatar : resolvedBlueTeam.avatar
  const activeTeamClass = team === 'red' ? styles.teamRed : styles.teamBlue
  const viewerReady = team === 'red' ? roomState.captainRedReady : roomState.captainBlueReady
  const startingTeamAvatar = roomState.startingTeam === 'red' ? resolvedRedTeam.avatar : resolvedBlueTeam.avatar

  const startingTeamLabel =
    roomState.startingTeam === 'red' ? redTeamLabel : roomState.startingTeam === 'blue' ? blueTeamLabel : null
  const isReconnectRequired =
    hasSyncedRoomState &&
    !hostDisconnected &&
    !devicesDisconnectedByHost &&
    !sessionCodeChangedRoomId &&
    (roomState.phase === 'playing' || roomState.phase === 'assassin-reveal') &&
    (!roomState.captainRedConnected || !roomState.captainBlueConnected)
  const shouldExitAfterSessionInvalidation =
    hasSyncedRoomState &&
    sessionInvalidated &&
    !sessionCodeChangedRoomId
  const runtimeStatus = getCaptainRuntimeStatus({
    phase: roomState.phase,
    hostConnected: roomState.hostConnected,
    captainRedConnected: roomState.captainRedConnected,
    captainBlueConnected: roomState.captainBlueConnected,
    captainRedReady: roomState.captainRedReady,
    captainBlueReady: roomState.captainBlueReady,
    boardUnlocked: roomState.boardUnlocked,
    assassinTeam: roomState.assassinTeam,
    roundWinsRed: roomState.roundWinsRed,
    roundWinsBlue: roomState.roundWinsBlue,
    viewerTeam: team,
  })

  useEffect(() => {
    if (!shouldExitAfterSessionInvalidation) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      router.replace('/games/codenames')
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [router, shouldExitAfterSessionInvalidation])

  useEffect(() => {
    if (!shouldWarnBeforeUnload(roomState.phase)) {
      return
    }

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const currentUrl = window.location.href
    window.history.pushState({ guard: `codenames-captain-${team}` }, '', currentUrl)

    const popStateHandler = () => {
      window.history.pushState({ guard: `codenames-captain-${team}` }, '', currentUrl)
      setIsBrowserExitAlertOpen(true)
    }

    window.addEventListener('beforeunload', beforeUnloadHandler)
    window.addEventListener('popstate', popStateHandler)

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      window.removeEventListener('popstate', popStateHandler)
    }
  }, [roomState.phase, team])

  return (
    <>
      <div className={styles.screen}>
        {screenMode === 'waiting' ? (
          <div className={styles.waitingShell}>
            <div className={styles.waitingCard}>
              <div className={styles.waitingIdentity}>
                <div className={styles.waitingAvatarFrame} data-team={team} aria-hidden="true">
                  <AvatarAsset avatar={activeTeamAvatar} size={58} />
                </div>
              </div>
              <span className={styles.waitingEyebrow}>JESTES</span>
              <div className={styles.waitingTeamCopy}>
                <span className={styles.waitingRole}>{team === 'red' ? 'Kapitan Czerwonych' : 'Kapitan Niebieskich'}</span>
                <h1 className={`${styles.teamName} ${activeTeamClass}`}>{activeTeamLabel}</h1>
              </div>
              {shouldExitAfterSessionInvalidation ? (
                <StatusGlyph kind="session-ended" />
              ) : devicesDisconnectedByHost ? (
                <StatusGlyph kind="devices-disconnected" />
              ) : sessionCodeChangedRoomId ? (
                <StatusGlyph kind="session-code-changed" />
              ) : (
                <div className={styles.loader} data-team={team} aria-hidden="true">
                  <span />
                </div>
              )}
              {shouldExitAfterSessionInvalidation ? (
                <>
                  <p className={styles.waitingTitle}>Poprzednia sesja została zakończona</p>
                  <p className={styles.waitingCopy}>Wracam do menu głównego...</p>
                </>
              ) : devicesDisconnectedByHost ? (
                <>
                  <p className={styles.waitingTitle}>Urządzenia zostały rozłączone</p>
                  <p className={styles.waitingCopy}>Host odłączył ten telefon od gry. Poczekaj na ponowne parowanie.</p>
                </>
              ) : sessionCodeChangedRoomId ? (
                <>
                  <p className={styles.waitingTitle}>Kod sesji został zmieniony</p>
                  <p className={styles.waitingCopy}>Host uruchomił nowy pokój: {sessionCodeChangedRoomId.toUpperCase()}</p>
                </>
              ) : (
                <>
                  <p className={styles.waitingTitle}>Czekam na start gry...</p>
                  <p className={styles.waitingCopy}>Host musi uruchomić grę na TV</p>
                  <button type="button" className={styles.changeRoleButton} onClick={onChangeRole}>
                    Zmień rolę
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.boardShell}>
            {isRoundIntroVisible ? (
              <RoundIntroOverlay
                roundNumber={boardMeta.currentRound}
                startingTeam={roomState.startingTeam ?? 'red'}
                startingTeamLabel={startingTeamLabel ?? 'START'}
                startingTeamAvatar={startingTeamAvatar}
              />
            ) : null}

            <header className={styles.topbar} aria-hidden={isRoundIntroVisible}>
              <section className={styles.teamPanelCaptain} data-team={team}>
                <div className={styles.teamPanelCaptainLeftRow}>
                  <div className={styles.teamAvatarFrame} data-team={team} aria-hidden="true">
                    <AvatarAsset avatar={activeTeamAvatar} size="72%" />
                  </div>
                  <span className={styles.teamLabel}>{activeTeamLabel}</span>
                </div>
              </section>

              <section className={styles.scorePanel} aria-label="Wynik i start">
                <div className={styles.scoreLine}>
                  <span className={`${styles.scoreValue} ${styles.scoreRed}`}>{boardMeta.roundWinsRed}</span>
                  <span className={styles.scoreSeparator}>:</span>
                  <span className={`${styles.scoreValue} ${styles.scoreBlue}`}>{boardMeta.roundWinsBlue}</span>
                </div>
                {startingTeamLabel ? (
                  <div className={styles.startingLine}>
                    <span className={styles.startingLabel}>ZACZYNAJA:</span>
                    <strong className={styles.startingTeamName} data-team={roomState.startingTeam}>
                      {startingTeamLabel}
                    </strong>
                  </div>
                ) : null}
              </section>

              <section className={styles.roundPanel} aria-label="Aktualna runda">
                <span className={styles.roundChipLabel}>RUNDA</span>
                <strong className={styles.roundChipValue}>{boardMeta.currentRound}</strong>
              </section>
            </header>

            <main className={styles.boardViewport}>
              <div className={styles.boardFrame}>
                <CaptainGrid
                  cards={roomState.cards}
                  startingTeam={roomState.startingTeam}
                  isLocked={isRoundIntroVisible}
                  isConcealed={!roomState.boardUnlocked}
                  revealAll={roomState.phase === 'ended'}
                />
              </div>
            </main>

            <footer className={styles.bottomDock} aria-hidden={isRoundIntroVisible}>
              <div className={styles.bottomTray}>
                <div className={styles.countBadge} data-team="red">
                  <div className={styles.countBadgeIcon}>
                    <AvatarAsset avatar={resolvedRedTeam.avatar} size={14} />
                  </div>
                  <strong className={styles.countBadgeValue}>{boardMeta.redRemaining}</strong>
                  <span className={styles.countBadgeLabel}>pozostało</span>
                </div>

                <div className={styles.countBadge} data-team="blue">
                  <div className={styles.countBadgeIcon}>
                    <AvatarAsset avatar={resolvedBlueTeam.avatar} size={14} />
                  </div>
                  <strong className={styles.countBadgeValue}>{boardMeta.blueRemaining}</strong>
                  <span className={styles.countBadgeLabel}>pozostało</span>
                </div>
              </div>
            </footer>

            {isReconnectRequired ? (
              <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Wstrzymano gre">
                <div className={styles.connectionModal}>
                  <span className={styles.connectionEyebrow}>Gra wstrzymana</span>
                  <h2 className={styles.connectionTitle}>Czekam na oba urządzenia kapitanów</h2>
                  <p className={styles.connectionCopy}>Połączenie wróci automatycznie, gdy drugi kapitan połączy się ponownie.</p>
                </div>
              </div>
            ) : null}

            {shouldExitAfterSessionInvalidation ? (
              <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Poprzednia sesja została zakończona">
                <div className={styles.connectionModal}>
                  <span className={styles.connectionEyebrow}>Sesja zakończona</span>
                  <h2 className={styles.connectionTitle}>Poprzednia sesja nie jest już aktywna</h2>
                  <p className={styles.connectionCopy}>Jeśli host uruchomił nowy pokój, dołącz do niego ponownie z nowym kodem.</p>
                </div>
              </div>
            ) : devicesDisconnectedByHost ? (
              <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Urządzenia zostały rozłączone">
                <div className={styles.connectionModal}>
                  <span className={styles.connectionEyebrow}>Urządzenie rozłączone</span>
                  <h2 className={styles.connectionTitle}>Host odłączył ten telefon od gry</h2>
                  <p className={styles.connectionCopy}>Ta karta nie jest już aktywna. Poczekaj, aż host połączy urządzenia ponownie.</p>
                </div>
              </div>
            ) : sessionCodeChangedRoomId ? (
              <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Kod sesji został zmieniony">
                <div className={styles.connectionModal}>
                  <span className={styles.connectionEyebrow}>Nowy kod sesji</span>
                  <h2 className={styles.connectionTitle}>Host zmienił kod pokoju</h2>
                  <p className={styles.connectionCopy}>Ta karta nie jest już aktywna. Dołącz ponownie z kodem {sessionCodeChangedRoomId.toUpperCase()}.</p>
                </div>
              </div>
            ) : null}

            {!isReconnectRequired && !shouldExitAfterSessionInvalidation && !devicesDisconnectedByHost && !sessionCodeChangedRoomId && runtimeStatus ? (
              <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label={runtimeStatus.title}>
                <div className={styles.connectionModal}>
                  <span className={styles.connectionEyebrow}>{runtimeStatus.eyebrow}</span>
                  <h2 className={styles.connectionTitle}>{runtimeStatus.title}</h2>
                  <p className={styles.connectionCopy}>{runtimeStatus.description}</p>
                  {!roomState.boardUnlocked && roomState.phase === 'playing' ? (
                    <button
                      type="button"
                      className={`${styles.readyButton} ${viewerReady ? styles.readyButtonReady : ''}`}
                      onClick={markReady}
                      disabled={viewerReady}
                    >
                      {viewerReady ? 'Gotowe. Czekam na drugiego kapitana' : 'Gotowy'}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <AlertDialog
        open={isBrowserExitAlertOpen}
        variant="danger"
        eyebrow="Gra w toku"
        title="Wrócić do menu?"
        description="Bieżąca rozgrywka zostanie przerwana i utracisz aktualny postęp."
        actions={[
          {
            label: 'Zostań w grze',
            onClick: () => setIsBrowserExitAlertOpen(false),
            variant: 'secondary',
          },
          {
            label: 'Tak, wróć do menu',
            onClick: () => router.push('/games/codenames'),
            variant: 'danger',
            fullWidth: true,
          },
        ]}
      />
    </>
  )
}

function StatusGlyph({ kind }: { kind: 'session-ended' | 'devices-disconnected' | 'session-code-changed' }) {
  if (kind === 'session-code-changed') {
    return (
      <div className={`${styles.waitingStatusIcon} ${styles.waitingStatusIconCode}`} aria-hidden="true">
        <KeyRound size={18} />
      </div>
    )
  }

  if (kind === 'devices-disconnected') {
    return (
      <div className={`${styles.waitingStatusIcon} ${styles.waitingStatusIconDisconnect}`} aria-hidden="true">
        <SmartphoneNfc size={18} />
      </div>
    )
  }

  return (
    <div className={`${styles.waitingStatusIcon} ${styles.waitingStatusIconEnded}`} aria-hidden="true">
      <CircleAlert size={18} />
    </div>
  )
}

function resolveCaptainTeam(team: Partial<CaptainTeam> | null | undefined, fallback: CaptainTeam): CaptainTeam {
  return {
    name: team?.name?.trim() || fallback.name,
    avatar: team?.avatar || fallback.avatar,
  }
}

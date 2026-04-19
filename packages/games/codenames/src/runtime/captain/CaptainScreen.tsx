'use client'

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
  const { roomState, hasSyncedRoomState, hostDisconnected, isRoundIntroVisible, markReady } = useCaptainGame({ roomId, team })
  const [isBrowserExitAlertOpen, setIsBrowserExitAlertOpen] = useState(false)
  const screenMode = getCaptainScreenMode(roomState)
  const boardMeta = getCaptainBoardMeta(roomState)

  const redTeamLabel = redTeam.name
  const blueTeamLabel = blueTeam.name
  const activeTeamLabel = team === 'red' ? redTeamLabel : blueTeamLabel
  const activeTeamAvatar = team === 'red' ? redTeam.avatar : blueTeam.avatar
  const activeTeamClass = team === 'red' ? styles.teamRed : styles.teamBlue
  const viewerReady = team === 'red' ? roomState.captainRedReady : roomState.captainBlueReady
  const startingTeamAvatar = roomState.startingTeam === 'red' ? redTeam.avatar : blueTeam.avatar

  const startingTeamLabel =
    roomState.startingTeam === 'red' ? redTeamLabel : roomState.startingTeam === 'blue' ? blueTeamLabel : null
  const isReconnectRequired =
    hasSyncedRoomState &&
    !hostDisconnected &&
    (roomState.phase === 'playing' || roomState.phase === 'assassin-reveal') &&
    (!roomState.captainRedConnected || !roomState.captainBlueConnected)
  const shouldExitAfterHostDisconnect =
    hasSyncedRoomState &&
    hostDisconnected &&
    roomState.phase !== 'waiting'
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
    if (!shouldExitAfterHostDisconnect) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      router.replace('/games/codenames')
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [router, shouldExitAfterHostDisconnect])

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
              <div className={styles.loader} data-team={team} aria-hidden="true">
                <span />
              </div>
              {shouldExitAfterHostDisconnect ? (
                <>
                  <p className={styles.waitingTitle}>Host opuscil pokoj</p>
                  <p className={styles.waitingCopy}>Wracam do menu glownego...</p>
                </>
              ) : (
                <>
                  <p className={styles.waitingTitle}>Czekam na start gry...</p>
                  <p className={styles.waitingCopy}>Host musi uruchomic gre na TV</p>
                  <button type="button" className={styles.changeRoleButton} onClick={onChangeRole}>
                    Zmien role
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
                    <AvatarAsset avatar={activeTeamAvatar} size={38} />
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
                />
              </div>
            </main>

            <footer className={styles.bottomDock} aria-hidden={isRoundIntroVisible}>
              <div className={styles.bottomTray}>
                <div className={styles.countBadge} data-team="red">
                  <div className={styles.countBadgeIcon}>
                    <AvatarAsset avatar={redTeam.avatar} size={14} />
                  </div>
                  <strong className={styles.countBadgeValue}>{boardMeta.redRemaining}</strong>
                  <span className={styles.countBadgeLabel}>pozostalo</span>
                </div>

                <div className={styles.countBadge} data-team="blue">
                  <div className={styles.countBadgeIcon}>
                    <AvatarAsset avatar={blueTeam.avatar} size={14} />
                  </div>
                  <strong className={styles.countBadgeValue}>{boardMeta.blueRemaining}</strong>
                  <span className={styles.countBadgeLabel}>pozostalo</span>
                </div>
              </div>
            </footer>

            {isReconnectRequired ? (
              <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Wstrzymano gre">
                <div className={styles.connectionModal}>
                  <span className={styles.connectionEyebrow}>Gra wstrzymana</span>
                  <h2 className={styles.connectionTitle}>Czekam na oba urzadzenia kapitanow</h2>
                  <p className={styles.connectionCopy}>Polaczenie wroci automatycznie, gdy drugi kapitan polaczy sie ponownie.</p>
                </div>
              </div>
            ) : null}

            {shouldExitAfterHostDisconnect ? (
              <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Host opuscil pokoj">
                <div className={styles.connectionModal}>
                  <span className={styles.connectionEyebrow}>Pokoj zamkniety</span>
                  <h2 className={styles.connectionTitle}>Host opuscil pokoj</h2>
                  <p className={styles.connectionCopy}>Wracam do menu glownego.</p>
                </div>
              </div>
            ) : null}

            {!isReconnectRequired && !shouldExitAfterHostDisconnect && runtimeStatus ? (
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
        title="Wrocic do menu?"
        description="Biezaca rozgrywka zostanie przerwana i utracisz aktualny postep."
        actions={[
          {
            label: 'Zostan w grze',
            onClick: () => setIsBrowserExitAlertOpen(false),
            variant: 'secondary',
          },
          {
            label: 'Tak, wroc do menu',
            onClick: () => router.push('/games/codenames'),
            variant: 'danger',
            fullWidth: true,
          },
        ]}
      />
    </>
  )
}

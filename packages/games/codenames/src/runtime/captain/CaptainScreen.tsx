'use client'

import { AvatarAsset } from '@party/ui'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptainGame } from './useCaptainGame'
import { CaptainGrid } from './CaptainGrid'
import { getCaptainScreenMode } from './screen-mode'
import { getCaptainBoardMeta } from './board-meta'
import { RoundIntroOverlay } from '../shared/RoundIntroOverlay'
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
  const { roomState, hasSyncedRoomState, hostDisconnected, isRoundIntroVisible } = useCaptainGame({ roomId, team })
  const screenMode = getCaptainScreenMode(roomState)
  const boardMeta = getCaptainBoardMeta(roomState)

  const redTeamLabel = redTeam.name.toUpperCase()
  const blueTeamLabel = blueTeam.name.toUpperCase()
  const activeTeamLabel = team === 'red' ? redTeamLabel : blueTeamLabel
  const activeTeamAvatar = team === 'red' ? redTeam.avatar : blueTeam.avatar
  const activeTeamClass = team === 'red' ? styles.teamRed : styles.teamBlue
  const startingTeamAvatar = roomState.startingTeam === 'red' ? redTeam.avatar : blueTeam.avatar

  const startingTeamLabel =
    roomState.startingTeam === 'red' ? redTeamLabel : roomState.startingTeam === 'blue' ? blueTeamLabel : null
  const isReconnectRequired =
    hasSyncedRoomState &&
    !hostDisconnected &&
    (roomState.phase === 'playing' || roomState.phase === 'assassin-reveal') &&
    (!roomState.captainRedConnected || !roomState.captainBlueConnected)

  useEffect(() => {
    if (!hasSyncedRoomState || !hostDisconnected) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      router.replace('/games/codenames')
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [hasSyncedRoomState, hostDisconnected, router])

  return (
    <div className={styles.screen}>
      {screenMode === 'waiting' ? (
        <div className={styles.waitingShell}>
          <div className={styles.waitingCard}>
            <div className={`${styles.teamDot} ${activeTeamClass}`} aria-hidden="true" />
            <span className={styles.waitingEyebrow}>JESTEŚ</span>
            <h1 className={`${styles.teamName} ${activeTeamClass}`}>{`KAPITAN ${activeTeamLabel}`}</h1>
            <div className={styles.loader} data-team={team} aria-hidden="true">
              <span />
            </div>
            {hasSyncedRoomState && hostDisconnected ? (
              <>
                <p className={styles.waitingTitle}>Host opuścił pokój</p>
                <p className={styles.waitingCopy}>Wracam do menu głównego...</p>
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
                  <span className={styles.startingLabel}>ZACZYNAJĄ:</span>
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
            {!isRoundIntroVisible ? (
              <div className={styles.boardFrame}>
                <CaptainGrid cards={roomState.cards} startingTeam={roomState.startingTeam} />
              </div>
            ) : null}
          </main>

          <footer className={styles.bottomDock} aria-hidden={isRoundIntroVisible}>
            <div className={styles.bottomTray}>
              <div className={styles.countBadge} data-team="red">
                <div className={styles.countBadgeIcon}>
                  <AvatarAsset avatar={redTeam.avatar} size={14} />
                </div>
                <strong className={styles.countBadgeValue}>{boardMeta.redRemaining}</strong>
                <span className={styles.countBadgeLabel}>pozostało</span>
              </div>

              <div className={styles.countBadge} data-team="blue">
                <div className={styles.countBadgeIcon}>
                  <AvatarAsset avatar={blueTeam.avatar} size={14} />
                </div>
                <strong className={styles.countBadgeValue}>{boardMeta.blueRemaining}</strong>
                <span className={styles.countBadgeLabel}>pozostało</span>
              </div>
            </div>
          </footer>

          {isReconnectRequired ? (
            <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Wstrzymano grę">
              <div className={styles.connectionModal}>
                <span className={styles.connectionEyebrow}>Gra wstrzymana</span>
                <h2 className={styles.connectionTitle}>Czekam na oba urządzenia kapitanów</h2>
                <p className={styles.connectionCopy}>Połączenie wróci automatycznie, gdy drugi kapitan połączy się ponownie.</p>
              </div>
            </div>
          ) : null}

          {hasSyncedRoomState && hostDisconnected ? (
            <div className={styles.connectionOverlay} role="dialog" aria-modal="true" aria-label="Host opuścił pokój">
              <div className={styles.connectionModal}>
                <span className={styles.connectionEyebrow}>Pokój zamknięty</span>
                <h2 className={styles.connectionTitle}>Host opuścił pokój</h2>
                <p className={styles.connectionCopy}>Wracam do menu głównego.</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

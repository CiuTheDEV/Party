'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertDialog, AvatarAsset } from '@party/ui'
import { useHostGame } from './useHostGame'
import { BoardGrid } from './BoardGrid'
import { AssassinModal } from './AssassinModal'
import { RoundSummaryScreen } from './RoundSummaryScreen'
import { MatchSummaryScreen } from './MatchSummaryScreen'
import { HostSettingsModal } from './HostSettingsModal'
import { getHostEndScreenMode } from './end-screen-mode'
import { RoundIntroOverlay } from '../shared/RoundIntroOverlay'
import { getHostRuntimeStatus, shouldWarnBeforeUnload } from '../shared/runtime-status'
import { CaptainPairingModal } from '../../setup/components/CaptainPairingPanel'
import styles from './HostGameScreen.module.css'

type CodenamesTeam = { name: string; avatar: string }

type HostGameScreenProps = {
  categories: Array<{ id: string; words: string[] }>
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  roundsToWin: number
}

export function HostGameScreen({ roomId, categories, teams, roundsToWin }: HostGameScreenProps) {
  const router = useRouter()
  const {
    roomState,
    hasSyncedRoomState,
    revealCard,
    setAssassinTeam,
    resetGame,
    restartMatch,
    startGame,
    isRoundIntroVisible,
    startBlockedReason,
    clearStartBlockedReason,
  } = useHostGame({ roomId, categories })
  const [showEntryIntro, setShowEntryIntro] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSettingsExitConfirmOpen, setIsSettingsExitConfirmOpen] = useState(false)
  const [settingsFocusTarget, setSettingsFocusTarget] = useState<'sound' | 'animations' | 'exit' | 'continue'>('sound')
  const [settingsExitConfirmFocusTarget, setSettingsExitConfirmFocusTarget] = useState<'stay' | 'exit'>('stay')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isBrowserExitAlertOpen, setIsBrowserExitAlertOpen] = useState(false)

  const redTeam = teams[0]
  const blueTeam = teams[1]

  const redRoundWins = roomState.roundWinsRed
  const blueRoundWins = roomState.roundWinsBlue
  const endScreenMode = getHostEndScreenMode({ roundWinsRed: redRoundWins, roundWinsBlue: blueRoundWins, roundsToWin })
  const redRevealed = roomState.cards.filter((c) => c.color === 'red' && c.revealed).length
  const blueRevealed = roomState.cards.filter((c) => c.color === 'blue' && c.revealed).length
  const isCaptainReconnectRequired = !roomState.captainRedConnected || !roomState.captainBlueConnected
  const showReadyStatusInBottomBar =
    roomState.phase === 'playing' &&
    !roomState.boardUnlocked &&
    roomState.captainRedConnected &&
    roomState.captainBlueConnected
  const hostStatus = getHostRuntimeStatus({
    phase: roomState.phase,
    captainRedConnected: roomState.captainRedConnected,
    captainBlueConnected: roomState.captainBlueConnected,
    captainRedReady: roomState.captainRedReady,
    captainBlueReady: roomState.captainBlueReady,
    boardUnlocked: roomState.boardUnlocked,
    assassinTeam: roomState.assassinTeam,
  })
  const startingTeamLabel =
    roomState.startingTeam === 'red' ? redTeam.name.toUpperCase() : roomState.startingTeam === 'blue' ? blueTeam.name.toUpperCase() : null
  const startingTeamAvatar = roomState.startingTeam === 'red' ? redTeam.avatar : blueTeam.avatar
  const redReadyLabel = roomState.captainRedReady ? 'Gotowy' : 'Niegotowy'
  const blueReadyLabel = roomState.captainBlueReady ? 'Gotowy' : 'Niegotowy'
  const showReadyBadges = roomState.phase === 'playing' && !roomState.boardUnlocked

  useEffect(() => {
    if (!isSettingsOpen) {
      setIsSettingsExitConfirmOpen(false)
      setSettingsFocusTarget('sound')
      setSettingsExitConfirmFocusTarget('stay')
    }
  }, [isSettingsOpen])

  useEffect(() => {
    if (!hasSyncedRoomState) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowEntryIntro(false)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [hasSyncedRoomState])

  useEffect(() => {
    if (!shouldWarnBeforeUnload(roomState.phase)) {
      return
    }

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const currentUrl = window.location.href
    window.history.pushState({ guard: 'codenames-host-play' }, '', currentUrl)

    const popStateHandler = () => {
      window.history.pushState({ guard: 'codenames-host-play' }, '', currentUrl)
      setIsBrowserExitAlertOpen(true)
    }

    window.addEventListener('beforeunload', beforeUnloadHandler)
    window.addEventListener('popstate', popStateHandler)

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      window.removeEventListener('popstate', popStateHandler)
    }
  }, [roomState.phase])

  if (roomState.phase === 'ended') {
    const winnerTeam = roomState.winner === 'red' ? redTeam : blueTeam
    const loserTeam = roomState.winner === 'red' ? blueTeam : redTeam
    const reason: 'assassin' | 'victory' = roomState.assassinTeam ? 'assassin' : 'victory'

    if (endScreenMode === 'match') {
      return (
        <MatchSummaryScreen
          winnerTeam={winnerTeam}
          loserTeam={loserTeam}
          redTeam={redTeam}
          blueTeam={blueTeam}
          redRoundWins={redRoundWins}
          blueRoundWins={blueRoundWins}
          roundsToWin={roundsToWin}
          onReplayMatch={restartMatch}
          onExitToMenu={() => router.push('/games/codenames')}
        />
      )
    }

    return (
      <RoundSummaryScreen
        reason={reason}
        redTeam={redTeam}
        blueTeam={blueTeam}
        winnerTeam={winnerTeam}
        loserTeam={loserTeam}
        redRoundWins={redRoundWins}
        blueRoundWins={blueRoundWins}
        roundsToWin={roundsToWin}
        onNextRound={resetGame}
      />
    )
  }

  return (
    <>
      <div className={styles.screen}>
        {showEntryIntro ? (
          <div className={styles.entryIntro} role="presentation" aria-hidden="true">
            <div className={styles.entryIntroCard}>
              <span className={styles.entryIntroEyebrow}>Tajniacy</span>
              <h1 className={styles.entryIntroTitle}>Przygotowuje plansze</h1>
              <div className={styles.entryIntroTeams}>
                <div className={styles.entryIntroTeam} data-team="red">
                  <div className={styles.entryIntroAvatar} data-team="red">
                    <AvatarAsset avatar={redTeam.avatar} size={42} />
                  </div>
                  <span className={styles.entryIntroTeamName}>{redTeam.name}</span>
                </div>
                <span className={styles.entryIntroVs}>vs</span>
                <div className={styles.entryIntroTeam} data-team="blue">
                  <div className={styles.entryIntroAvatar} data-team="blue">
                    <AvatarAsset avatar={blueTeam.avatar} size={42} />
                  </div>
                  <span className={styles.entryIntroTeamName}>{blueTeam.name}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isRoundIntroVisible ? (
          <RoundIntroOverlay
            roundNumber={roomState.roundWinsRed + roomState.roundWinsBlue + 1}
            startingTeam={roomState.startingTeam ?? 'red'}
            startingTeamLabel={startingTeamLabel ?? 'START'}
            startingTeamAvatar={startingTeamAvatar}
          />
        ) : null}

        {roomState.phase === 'assassin-reveal' ? (
          <AssassinModal redTeam={redTeam} blueTeam={blueTeam} onSelectTeam={setAssassinTeam} />
        ) : null}

        <div className={styles.topbar} aria-hidden={isRoundIntroVisible}>
          <section className={styles.teamPanel} data-team="red">
            <div className={styles.teamPanelLeft}>
              <div className={styles.teamAvatarFrame} data-team="red">
                <AvatarAsset avatar={redTeam.avatar} size={38} />
              </div>
              <div className={styles.teamMeta}>
                <span className={styles.teamLabel}>{redTeam.name.toUpperCase()}</span>
                {showReadyBadges ? (
                  <span className={`${styles.readyBadge} ${roomState.captainRedReady ? styles.readyBadgeReady : ''}`}>
                    {redReadyLabel}
                  </span>
                ) : null}
              </div>
            </div>
            <div className={styles.teamScore} data-team="red">
              {redRoundWins}
            </div>
          </section>

          <div className={styles.centerControls} aria-label="Sterowanie plansza">
            <button
              type="button"
              className={styles.controlButton}
              onClick={() => setIsResetConfirmOpen(true)}
              aria-label="Nowa plansza"
            >
              ↻
            </button>
            <button
              type="button"
              className={styles.controlButton}
              aria-label="Ustawienia"
              onClick={() => setIsSettingsOpen(true)}
            >
              ⚙
            </button>
            <div className={styles.controlBadge}>DEV</div>
          </div>

          <section className={styles.teamPanel} data-team="blue">
            <div className={styles.teamScore} data-team="blue">
              {blueRoundWins}
            </div>
            <div className={styles.teamPanelRight}>
              <div className={styles.teamMeta} data-align="right">
                {showReadyBadges ? (
                  <span className={`${styles.readyBadge} ${roomState.captainBlueReady ? styles.readyBadgeReady : ''}`}>
                    {blueReadyLabel}
                  </span>
                ) : null}
                <span className={styles.teamLabel}>{blueTeam.name.toUpperCase()}</span>
              </div>
              <div className={styles.teamAvatarFrame} data-team="blue">
                <AvatarAsset avatar={blueTeam.avatar} size={38} />
              </div>
            </div>
          </section>
        </div>

        <div className={styles.boardWrapper}>
          <div className={styles.boardScaler}>
            <BoardGrid
              cards={roomState.cards}
              onReveal={revealCard}
              isLocked={isRoundIntroVisible}
              isConcealed={!roomState.boardUnlocked}
              startingTeam={roomState.startingTeam}
            />
          </div>
        </div>

        {hasSyncedRoomState && isCaptainReconnectRequired ? (
          <CaptainPairingModal
            roomId={roomId}
            teams={teams}
            captainRedConnected={roomState.captainRedConnected}
            captainBlueConnected={roomState.captainBlueConnected}
            showCloseButton={false}
          />
        ) : null}

        <div className={styles.bottombar} aria-hidden={isRoundIntroVisible}>
          {showReadyStatusInBottomBar && hostStatus ? (
            <section className={styles.waitingBottomBar} aria-live="polite">
              <span className={styles.waitingBottomEyebrow}>{hostStatus.eyebrow}</span>
              <strong className={styles.waitingBottomTitle}>{hostStatus.title}</strong>
            </section>
          ) : (
            <>
              <div className={styles.avatarRow}>
                {Array.from({ length: roomState.redTotal }).map((_, i) => {
                  const cardNum = i + 1
                  const isRevealed = cardNum <= redRevealed
                  return (
                    <div
                      key={i}
                      className={`${styles.avatarCard} ${isRevealed ? styles.avatarCardRevealed : ''}`}
                      data-team="red"
                    >
                      <AvatarAsset avatar={redTeam.avatar} size={26} />
                      <span className={styles.avatarCardNum}>{cardNum}</span>
                    </div>
                  )
                })}
              </div>

              <div className={styles.startingTeam}>
                {roomState.startingTeam ? (
                  <>
                    <span className={styles.startingLabel}>Zaczynaja:</span>
                    <span className={styles.startingTeamName} data-team={roomState.startingTeam}>
                      {roomState.startingTeam === 'red' ? redTeam.name.toUpperCase() : blueTeam.name.toUpperCase()}
                    </span>
                  </>
                ) : null}
              </div>

              <div className={styles.avatarRow} data-align="right">
                {Array.from({ length: roomState.blueTotal }).map((_, i) => {
                  const cardNum = roomState.blueTotal - i
                  const isRevealed = cardNum <= blueRevealed
                  return (
                    <div
                      key={i}
                      className={`${styles.avatarCard} ${isRevealed ? styles.avatarCardRevealed : ''}`}
                      data-team="blue"
                    >
                      <AvatarAsset avatar={blueTeam.avatar} size={26} />
                      <span className={styles.avatarCardNum}>{cardNum}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {isSettingsOpen ? (
          <HostSettingsModal
            canStartGame={roomState.phase === 'waiting' && roomState.captainRedConnected && roomState.captainBlueConnected}
            soundEnabled={soundEnabled}
            animationsEnabled={animationsEnabled}
            isExitConfirmOpen={isSettingsExitConfirmOpen}
            focusedTarget={settingsFocusTarget}
            exitConfirmFocusedTarget={settingsExitConfirmFocusTarget}
            onStartGame={() => {
              startGame()
              setIsSettingsOpen(false)
            }}
            onToggleSound={() => setSoundEnabled((current) => !current)}
            onToggleAnimations={() => setAnimationsEnabled((current) => !current)}
            onOpenExitConfirm={() => {
              setSettingsExitConfirmFocusTarget('stay')
              setIsSettingsExitConfirmOpen(true)
            }}
            onCancelExitConfirm={() => {
              setSettingsExitConfirmFocusTarget('stay')
              setIsSettingsExitConfirmOpen(false)
            }}
            onContinue={() => setIsSettingsOpen(false)}
            onExitToMenu={() => router.push('/games/codenames')}
          />
        ) : null}
      </div>

      <AlertDialog
        open={Boolean(startBlockedReason)}
        variant="warning"
        eyebrow="Pula hasel"
        title="Brak swiezych hasel na nowa plansze"
        description={startBlockedReason ?? ''}
        actions={[
          {
            label: 'Rozumiem',
            onClick: () => clearStartBlockedReason(),
            variant: 'primary',
            fullWidth: true,
          },
        ]}
      />

      <AlertDialog
        open={isResetConfirmOpen}
        variant="warning"
        eyebrow="Nowa plansza"
        title="Wylosowac nowa plansze?"
        description="Biezacy uklad kart zostanie zastapiony nowym."
        actions={[
          {
            label: 'Nie teraz',
            onClick: () => setIsResetConfirmOpen(false),
            variant: 'secondary',
          },
          {
            label: 'Tak, odswiez plansze',
            onClick: () => {
              setIsResetConfirmOpen(false)
              resetGame()
            },
            variant: 'primary',
            fullWidth: true,
          },
        ]}
      />

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

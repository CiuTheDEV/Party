'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AvatarAsset } from '@party/ui'
import { useHostGame } from './useHostGame'
import { BoardGrid } from './BoardGrid'
import { AssassinModal } from './AssassinModal'
import { RoundSummaryScreen } from './RoundSummaryScreen'
import { MatchSummaryScreen } from './MatchSummaryScreen'
import { HostSettingsModal } from './HostSettingsModal'
import { getHostEndScreenMode } from './end-screen-mode'
import { RoundIntroOverlay } from '../shared/RoundIntroOverlay'
import { CaptainPairingModal } from '../../setup/components/CaptainPairingPanel'
import styles from './HostGameScreen.module.css'

type CodenamesTeam = { name: string; avatar: string }

type HostGameScreenProps = {
  roomId: string
  wordPool: string[]
  teams: [CodenamesTeam, CodenamesTeam]
  roundsToWin: number
}

export function HostGameScreen({ roomId, wordPool, teams, roundsToWin }: HostGameScreenProps) {
  const router = useRouter()
  const { roomState, revealCard, setAssassinTeam, resetGame, restartMatch, isRoundIntroVisible } = useHostGame({ roomId, wordPool })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSettingsExitConfirmOpen, setIsSettingsExitConfirmOpen] = useState(false)
  const [settingsFocusTarget, setSettingsFocusTarget] = useState<'sound' | 'animations' | 'exit' | 'continue'>('sound')
  const [settingsExitConfirmFocusTarget, setSettingsExitConfirmFocusTarget] = useState<'stay' | 'exit'>('stay')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  const redTeam = teams[0]
  const blueTeam = teams[1]

  const redRoundWins = roomState.roundWinsRed
  const blueRoundWins = roomState.roundWinsBlue
  const endScreenMode = getHostEndScreenMode({ roundWinsRed: redRoundWins, roundWinsBlue: blueRoundWins, roundsToWin })
  const redRevealed = roomState.cards.filter((c) => c.color === 'red' && c.revealed).length
  const blueRevealed = roomState.cards.filter((c) => c.color === 'blue' && c.revealed).length
  const isCaptainReconnectRequired = !roomState.captainRedConnected || !roomState.captainBlueConnected
  const startingTeamLabel =
    roomState.startingTeam === 'red' ? redTeam.name.toUpperCase() : roomState.startingTeam === 'blue' ? blueTeam.name.toUpperCase() : null
  const startingTeamAvatar = roomState.startingTeam === 'red' ? redTeam.avatar : blueTeam.avatar

  useEffect(() => {
    if (!isSettingsOpen) {
      setIsSettingsExitConfirmOpen(false)
      setSettingsFocusTarget('sound')
      setSettingsExitConfirmFocusTarget('stay')
    }
  }, [isSettingsOpen])

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
    <div className={styles.screen}>
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
            <span className={styles.teamLabel}>{redTeam.name.toUpperCase()}</span>
          </div>
          <div className={styles.teamScore} data-team="red">
            {redRoundWins}
          </div>
        </section>

        <div className={styles.centerControls} aria-label="Sterowanie planszą">
          <button type="button" className={styles.controlButton} onClick={resetGame} aria-label="Nowa plansza">
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
            <span className={styles.teamLabel}>{blueTeam.name.toUpperCase()}</span>
            <div className={styles.teamAvatarFrame} data-team="blue">
              <AvatarAsset avatar={blueTeam.avatar} size={38} />
            </div>
          </div>
        </section>
      </div>

      <div className={styles.boardWrapper}>
        <div className={styles.boardScaler}>
          <BoardGrid cards={roomState.cards} onReveal={revealCard} isLocked={isRoundIntroVisible} startingTeam={roomState.startingTeam} />
        </div>
      </div>

      {isCaptainReconnectRequired ? (
        <CaptainPairingModal
          roomId={roomId}
          teams={teams}
          captainRedConnected={roomState.captainRedConnected}
          captainBlueConnected={roomState.captainBlueConnected}
          showCloseButton={false}
        />
      ) : null}

      <div className={styles.bottombar} aria-hidden={isRoundIntroVisible}>
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
              <span className={styles.startingLabel}>Zaczynają:</span>
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
      </div>

      {isSettingsOpen ? (
        <HostSettingsModal
          soundEnabled={soundEnabled}
          animationsEnabled={animationsEnabled}
          isExitConfirmOpen={isSettingsExitConfirmOpen}
          focusedTarget={settingsFocusTarget}
          exitConfirmFocusedTarget={settingsExitConfirmFocusTarget}
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
  )
}

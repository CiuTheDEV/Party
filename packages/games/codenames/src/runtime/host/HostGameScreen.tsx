'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertDialog, AvatarAsset, type HostNavigationFocusSnapshot } from '@party/ui'
import { useHostGame } from './useHostGame'
import { BoardGrid } from './BoardGrid'
import { AssassinModal } from './AssassinModal'
import { RoundSummaryScreen } from './RoundSummaryScreen'
import { MatchSummaryScreen } from './MatchSummaryScreen'
import { HostSettingsModal } from './HostSettingsModal'
import { getHostEndScreenMode } from './end-screen-mode'
import {
  CODENAMES_BINDINGS_STORAGE_KEY,
  CODENAMES_BINDINGS_UPDATED_EVENT,
  formatControllerLabelForProfile,
  loadPersistedBindings,
  type GamepadProfile,
} from '../../menu/codenames-controls-bindings'
import {
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesRuntimeEntryTarget,
  parseCodenamesRuntimeBoardTargetId,
} from '../../navigation/codenames-navigation-targets'
import { RoundIntroOverlay } from '../shared/RoundIntroOverlay'
import { getHostRuntimeStatus, shouldWarnBeforeUnload } from '../shared/runtime-status'
import { CaptainPairingModal } from '../../setup/components/CaptainPairingPanel'
import { getVisibleHostControlActionLabel, type HostControlCommand } from './host-controls'
import { useHostControls } from './useHostControls'
import { RuntimeStatusRail } from './RuntimeStatusRail'
import styles from './HostGameScreen.module.css'

type CodenamesTeam = { name: string; avatar: string }
type CodenamesCategoryBalance = {
  leftCategoryId: string
  rightCategoryId: string
  leftSharePercent: number
}

type HostGameScreenProps = {
  categories: Array<{ id: string; words: string[] }>
  roomId: string
  teams: [CodenamesTeam, CodenamesTeam]
  roundsToWin: number
  categoryBalance: CodenamesCategoryBalance | null
}

export function HostGameScreen({ roomId, categories, teams, roundsToWin, categoryBalance }: HostGameScreenProps) {
  const router = useRouter()
  const {
    roomState,
    hasSyncedRoomState,
    resetCount,
    revealCard,
    setAssassinTeam,
    resetGame,
    restartMatch,
    startGame,
    isRoundIntroVisible,
    startBlockedReason,
    clearStartBlockedReason,
    resetPoolAndRetryStart,
  } = useHostGame({ roomId, categories, teams, categoryBalance })
  const [showEntryIntro, setShowEntryIntro] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [isStatusRailOpen, setIsStatusRailOpen] = useState(false)
  const [boardSelectionIndex, setBoardSelectionIndex] = useState(12)
  const [assassinFocusedTeam, setAssassinFocusedTeam] = useState<'red' | 'blue'>('red')
  const [activeInputDevice, setActiveInputDevice] = useState<'keyboard' | 'controller'>('keyboard')
  const [controllerProfile, setControllerProfile] = useState<GamepadProfile>('generic')
  const [controlBindings, setControlBindings] = useState(() => loadPersistedBindings())
  const [pendingExitResetCount, setPendingExitResetCount] = useState<number | null>(null)
  const openModalRef = useRef<(target: HostNavigationFocusSnapshot) => void>(() => undefined)
  const closeModalRef = useRef<() => void>(() => undefined)

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
      openModalRef.current({
        screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
        zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBrowserExit,
        targetId: CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitStay,
      })
    }

    window.addEventListener('beforeunload', beforeUnloadHandler)
    window.addEventListener('popstate', popStateHandler)

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      window.removeEventListener('popstate', popStateHandler)
    }
  }, [roomState.phase])

  const exitToMenu = useCallback(() => {
    setPendingExitResetCount(resetCount)
    resetGame({ autoRestart: false })
  }, [resetCount, resetGame])

  useEffect(() => {
    if (pendingExitResetCount === null) {
      return
    }

    if (resetCount <= pendingExitResetCount) {
      return
    }

    setPendingExitResetCount(null)
    router.push('/games/codenames')
  }, [pendingExitResetCount, resetCount, router])

  const handleHostControlCommand = useCallback(
    (command: HostControlCommand) => {
      switch (command.type) {
        case 'reveal-card':
          revealCard(command.index)
          return
        case 'toggle-status-rail':
          setIsStatusRailOpen((current) => !current)
          return
        case 'open-settings':
          openModalRef.current({
            screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
            zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettings,
            targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseSound,
          })
          return
        case 'close-settings':
          closeModalRef.current()
          return
        case 'toggle-settings-sound':
          setSoundEnabled((current) => !current)
          return
        case 'toggle-settings-animations':
          setAnimationsEnabled((current) => !current)
          return
        case 'start-game':
          startGame()
          closeModalRef.current()
          return
        case 'confirm-reset':
          closeModalRef.current()
          resetGame()
          return
        case 'confirm-assassin-team':
          setAssassinTeam(command.team)
          return
        case 'close-start-blocked':
          clearStartBlockedReason()
          closeModalRef.current()
          return
        case 'reset-pool-and-retry':
          closeModalRef.current()
          resetPoolAndRetryStart()
          return
        case 'exit-to-menu':
          exitToMenu()
          return
      }
    },
    [clearStartBlockedReason, exitToMenu, resetGame, resetPoolAndRetryStart, revealCard, setAssassinTeam, startGame],
  )

  const runtimeControls = useHostControls({
    enabled: !showEntryIntro && hasSyncedRoomState,
    commandContext: {
      phase: roomState.phase,
      boardSelectionIndex,
      boardUnlocked: roomState.boardUnlocked && !isRoundIntroVisible,
      assassinFocusedTeam,
      canStartGame: roomState.phase === 'waiting' && roomState.captainRedConnected && roomState.captainBlueConnected,
      boardCardCount: roomState.cards.length,
      isStatusRailOpen,
    },
    onCommand: handleHostControlCommand,
    onDeviceChange: setActiveInputDevice,
    onControllerProfileChange: setControllerProfile,
  })

  useEffect(() => {
    openModalRef.current = runtimeControls.openModal
    closeModalRef.current = runtimeControls.closeModal
  }, [runtimeControls.closeModal, runtimeControls.openModal])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CODENAMES_BINDINGS_STORAGE_KEY) {
        setControlBindings(loadPersistedBindings())
      }
    }

    function handleBindingsUpdated() {
      setControlBindings(loadPersistedBindings())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CODENAMES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CODENAMES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    }
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse') {
        return
      }

      runtimeControls.sleep()
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [runtimeControls.sleep])

  useEffect(() => {
    if (runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeBoard) {
      const nextBoardIndex = parseCodenamesRuntimeBoardTargetId(runtimeControls.focusState.targetId)
      if (nextBoardIndex !== null) {
        setBoardSelectionIndex(nextBoardIndex)
      }
    }

    if (runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeAssassin) {
      setAssassinFocusedTeam(
        runtimeControls.focusState.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeAssassinBlue ? 'blue' : 'red',
      )
    }
  }, [runtimeControls.focusState])

  useEffect(() => {
    if (!startBlockedReason) {
      return
    }

    if (runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeStartBlocked) {
      return
    }

    runtimeControls.openModal({
      screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
      zoneId: CODENAMES_NAVIGATION_ZONES.runtimeStartBlocked,
      targetId: CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedReset,
    })
  }, [startBlockedReason, runtimeControls.focusState.zoneId, runtimeControls.openModal])

  useEffect(() => {
    if (roomState.phase !== 'assassin-reveal') {
      return
    }

    if (runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeAssassin) {
      return
    }

    runtimeControls.openModal({
      screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
      zoneId: CODENAMES_NAVIGATION_ZONES.runtimeAssassin,
      targetId: CODENAMES_NAVIGATION_TARGETS.runtimeAssassinRed,
    })
  }, [roomState.phase, runtimeControls.focusState.zoneId, runtimeControls.openModal])

  const isSettingsOpen =
    runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeSettings ||
    runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeSettingsConfirm
  const isSettingsExitConfirmOpen =
    runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeSettingsConfirm
  const settingsFocusTarget: 'sound' | 'animations' | 'exit' | 'continue' = useMemo(() => {
    switch (runtimeControls.focusState.targetId) {
      case CODENAMES_NAVIGATION_TARGETS.runtimePauseAnimations:
        return 'animations'
      case CODENAMES_NAVIGATION_TARGETS.runtimePauseExit:
        return 'exit'
      case CODENAMES_NAVIGATION_TARGETS.runtimePauseContinue:
        return 'continue'
      default:
        return 'sound'
    }
  }, [runtimeControls.focusState.targetId])
  const settingsExitConfirmFocusTarget: 'stay' | 'exit' =
    runtimeControls.focusState.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmExit ? 'exit' : 'stay'
  const isResetConfirmOpen =
    runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeResetConfirm
  const isBrowserExitAlertOpen =
    runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeBrowserExit
  const visibleControlLabel = useCallback(
    (action: 'confirm' | 'back' | 'menu' | 'rail') =>
      getVisibleHostControlActionLabel(
        controlBindings,
        activeInputDevice,
        action,
        formatControllerLabelForProfile,
        controllerProfile,
      ),
    [activeInputDevice, controlBindings, controllerProfile],
  )
  const selectedCardActionLabel = useMemo(() => {
    return visibleControlLabel('confirm')
  }, [visibleControlLabel])
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
          onReplayMatch={() => {
            const entryTarget = getCodenamesRuntimeEntryTarget()
            runtimeControls.setFocus({
              screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
              zoneId: entryTarget.zoneId,
              targetId: entryTarget.targetId,
            })
            restartMatch()
          }}
          onExitToMenu={exitToMenu}
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
        onNextRound={() => {
          const entryTarget = getCodenamesRuntimeEntryTarget()
          runtimeControls.setFocus({
            screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
            zoneId: entryTarget.zoneId,
            targetId: entryTarget.targetId,
          })
          resetGame()
        }}
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
          <AssassinModal
            redTeam={redTeam}
            blueTeam={blueTeam}
            focusedTeam={assassinFocusedTeam}
            confirmActionLabel={selectedCardActionLabel}
            isFocusVisible={runtimeControls.inputState.isAwake}
            onSelectTeam={setAssassinTeam}
          />
        ) : null}

        <RuntimeStatusRail
          open={isStatusRailOpen}
          roomId={roomId}
          redTeam={redTeam}
          blueTeam={blueTeam}
          roundsToWin={roundsToWin}
          roomState={roomState}
          status={hostStatus}
          railLabel={visibleControlLabel('rail')}
        />

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
              onClick={() =>
                runtimeControls.openModal({
                  screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
                  zoneId: CODENAMES_NAVIGATION_ZONES.runtimeResetConfirm,
                  targetId: CODENAMES_NAVIGATION_TARGETS.runtimeResetCancel,
                })
              }
              aria-label="Nowa plansza"
            >
              ↻
            </button>
            <button
              type="button"
              className={styles.controlButton}
              aria-label="Ustawienia"
              onClick={() =>
                runtimeControls.openModal({
                  screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
                  zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettings,
                  targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseSound,
                })
              }
            >
              ⚙
            </button>
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
              selectedIndex={boardSelectionIndex}
              selectedActionLabel={selectedCardActionLabel}
              isFocusVisible={
                runtimeControls.inputState.isAwake &&
                runtimeControls.focusState.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeBoard
              }
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
            confirmActionLabel={visibleControlLabel('confirm')}
            isFocusVisible={runtimeControls.inputState.isAwake}
            onStartGame={() => {
              startGame()
              runtimeControls.closeModal()
            }}
            onToggleSound={() => setSoundEnabled((current) => !current)}
            onToggleAnimations={() => setAnimationsEnabled((current) => !current)}
            onOpenExitConfirm={() =>
              runtimeControls.openModal({
                screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
                zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettingsConfirm,
                targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmStay,
              })
            }
            onCancelExitConfirm={() => runtimeControls.closeModal()}
            onContinue={() => runtimeControls.closeModal()}
            onExitToMenu={exitToMenu}
          />
        ) : null}
      </div>

      <AlertDialog
        open={Boolean(startBlockedReason)}
        variant="warning"
        eyebrow="Pula hasel"
        title="Brak świeżych haseł na nową planszę"
        description={startBlockedReason ?? ''}
        focusedActionIndex={
          runtimeControls.focusState.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedReset ? 1 : 0
        }
        isFocusVisible={runtimeControls.inputState.isAwake}
        actions={[
          {
            label: 'Nie teraz',
            hintLabel:
              runtimeControls.focusState.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedClose
                ? visibleControlLabel('confirm')
                : null,
            onClick: () => {
              clearStartBlockedReason()
              runtimeControls.closeModal()
            },
            variant: 'secondary',
          },
          {
            label: 'Zresetuj pule i sprobuj ponownie',
            hintLabel:
              runtimeControls.focusState.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedReset
                ? visibleControlLabel('confirm')
                : null,
            onClick: () => {
              runtimeControls.closeModal()
              resetPoolAndRetryStart()
            },
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
        focusedActionIndex={
          runtimeControls.focusState.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeResetConfirm ? 1 : 0
        }
        isFocusVisible={runtimeControls.inputState.isAwake}
        actions={[
          {
            label: 'Nie teraz',
            onClick: () => runtimeControls.closeModal(),
            variant: 'secondary',
          },
          {
            label: 'Tak, odswiez plansze',
            onClick: () => {
              runtimeControls.closeModal()
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
          title="Wrócić do menu?"
        description="Bieżąca rozgrywka zostanie przerwana i utracisz aktualny postęp."
        focusedActionIndex={
          runtimeControls.focusState.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitExit ? 1 : 0
        }
        isFocusVisible={runtimeControls.inputState.isAwake}
          actions={[
            {
              label: 'Zostan w grze',
              hintLabel: visibleControlLabel('confirm'),
              onClick: () => runtimeControls.closeModal(),
              variant: 'secondary',
            },
            {
              label: 'Tak, wroc do menu',
              hintLabel: visibleControlLabel('confirm'),
              onClick: exitToMenu,
              variant: 'danger',
              fullWidth: true,
            },
          ]}
      />
    </>
  )
}

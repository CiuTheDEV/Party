'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  buildPromptPool,
  charadesModule,
  CharadesDeviceListener,
  CharadesMenuContent,
  clearPresenterSession,
  createCharadesRoomId,
  ensureCharadesWordHistorySession,
  getRemainingUniqueWordCount,
  getTotalUniqueWordCount,
  isPresenterSessionFresh,
  isCharadesCategoryUnlocked,
  normalizeCharadesSettings,
  openCharadesPoolManager,
  readCharadesSetup,
  readCharadesWordHistory,
  readPresenterSession,
  startNewCharadesWordHistorySession,
  sanitizeCharadesSelectedCategories,
  useMenuControls,
  writeCharadesSetup,
  type CharadesSetupHelpers,
  type CharadesSetupState,
} from '@party/charades'
import { allCategories } from '@content/charades/index'
import { GameSetupTemplate } from '@party/ui'
import { useAuth } from '../../providers'
import { useCharadesMenuView } from './menu-view-context'
import styles from './page.module.css'

const DeviceListener = dynamic(async () => CharadesDeviceListener, { ssr: false })
const EMPTY_ENTITLEMENTS: string[] = []

type StartWarningState = {
  remaining: number
  total: number
  demand: number
}

type SetupFocusTarget = 'close' | 'start'
type StartWarningFocusTarget = 'back' | 'manage' | 'start'
type SetupUiState = {
  showSetup: boolean
  isPairingModalOpen: boolean
}
type PendingSessionCodeChange = {
  type: 'disconnect-devices' | 'session-code-change'
  nextRoomId: string
  resetWordHistory: boolean
}

export default function CharadesMenuPage() {
  const router = useRouter()
  const { user, isLoading, redeemActivationCode } = useAuth()
  const {
    activeMenuView,
    requestMenuViewChange,
    menuFocusArea,
    setMenuFocusArea,
    railFocusedHref,
    setRailFocusedHref,
    setIsRailForcedExpanded,
    setIsMenuInputSuspended,
    isControllerWakeGuardActive,
    isHostInputAwake,
    wakeHostInput,
    sleepHostInput,
    registerSettingsExitGuard,
    commitMenuViewChange,
    setHasUnsavedSettingsChanges,
  } = useCharadesMenuView()
  const [setupUi, setSetupUi] = useState<SetupUiState>({
    showSetup: false,
    isPairingModalOpen: false,
  })
  const [isSetupReady, setIsSetupReady] = useState(false)
  const [setupState, setSetupState] = useState<CharadesSetupState>(() => charadesModule.createInitialSetupState())
  const [startWarning, setStartWarning] = useState<StartWarningState | null>(null)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [setupFocus, setSetupFocus] = useState<SetupFocusTarget>('start')
  const [warningFocus, setWarningFocus] = useState<StartWarningFocusTarget>('start')
  const [pendingSessionCodeChange, setPendingSessionCodeChange] = useState<PendingSessionCodeChange | null>(null)
  const entitlements = user?.entitlements ?? EMPTY_ENTITLEMENTS

  const hasCategoryAccess = useMemo(
    () => (categoryId: string) => isCharadesCategoryUnlocked(categoryId, entitlements),
    [entitlements],
  )

  useEffect(() => {
    const storedSetup = readCharadesSetup()
    const nextRoomId = storedSetup?.roomId || createCharadesRoomId()

    if (storedSetup?.roomId) {
      ensureCharadesWordHistorySession()
    } else {
      startNewCharadesWordHistorySession()
    }

    setSetupState((current) => ({
      ...current,
      roomId: nextRoomId,
      players: storedSetup?.players ?? current.players,
      selectedCategories: storedSetup?.selectedCategories ?? current.selectedCategories,
      settings: normalizeCharadesSettings(storedSetup?.settings),
      isDeviceConnected: isPresenterSessionFresh(readPresenterSession(), nextRoomId),
    }))
    setIsSetupReady(true)
  }, [])

  useEffect(() => {
    if (isLoading || !isSetupReady) {
      return
    }

    setSetupState((current) => {
      const nextSelectedCategories = sanitizeCharadesSelectedCategories(current.selectedCategories, allCategories, entitlements)

      if (nextSelectedCategories === current.selectedCategories) {
        return current
      }

      return {
        ...current,
        selectedCategories: nextSelectedCategories,
      }
    })
  }, [entitlements, isLoading, isSetupReady])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const shouldShowSetup = params.get('setup') === '1'
    const shouldShowPairing = shouldShowSetup && params.get('pairing') === '1'

    if (shouldShowSetup) {
      setSetupUi({
        showSetup: true,
        isPairingModalOpen: shouldShowPairing,
      })
      requestMenuViewChange('mode')
    }
  }, [requestMenuViewChange])

  const updateSetupUi = useCallback((nextState: SetupUiState | ((current: SetupUiState) => SetupUiState)) => {
    setSetupUi((current) => {
      const resolvedState = typeof nextState === 'function' ? nextState(current) : nextState

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)

        if (resolvedState.showSetup) {
          url.searchParams.set('setup', '1')
        } else {
          url.searchParams.delete('setup')
        }

        if (resolvedState.showSetup && resolvedState.isPairingModalOpen) {
          url.searchParams.set('pairing', '1')
        } else {
          url.searchParams.delete('pairing')
        }

        window.history.replaceState(window.history.state, '', url)
      }

      return resolvedState
    })
  }, [])

  useEffect(() => {
    setIsMenuInputSuspended(setupUi.showSetup || startWarning !== null || isSettingsModalOpen)
    return () => setIsMenuInputSuspended(false)
  }, [isSettingsModalOpen, setIsMenuInputSuspended, setupUi.showSetup, startWarning])

  useEffect(() => {
    if (!isSetupReady || !setupState.roomId) {
      return
    }

    writeCharadesSetup({
      roomId: setupState.roomId,
      players: setupState.players,
      selectedCategories: setupState.selectedCategories,
      settings: setupState.settings,
    })
  }, [isSetupReady, setupState])

  const applyCharadesRoomTransition = useCallback((transition: PendingSessionCodeChange) => {
    setPendingSessionCodeChange(null)
    clearPresenterSession()

    if (transition.resetWordHistory) {
      startNewCharadesWordHistorySession()
    }

    setSetupState((current) => ({
      ...current,
      roomId: transition.nextRoomId,
      isDeviceConnected: false,
    }))
  }, [])

  const requestCharadesRoomTransition = useCallback((type: 'disconnect-devices' | 'session-code-change', resetWordHistory: boolean) => {
    const nextRoomId = createCharadesRoomId()

    if (!isSetupReady || !setupState.roomId || nextRoomId === setupState.roomId) {
      applyCharadesRoomTransition({
        type,
        nextRoomId,
        resetWordHistory,
      })
      return
    }

    setPendingSessionCodeChange({
      type,
      nextRoomId,
      resetWordHistory,
    })
  }, [applyCharadesRoomTransition, isSetupReady, setupState.roomId])

  useEffect(() => {
    if (!pendingSessionCodeChange) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      applyCharadesRoomTransition(pendingSessionCodeChange)
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [applyCharadesRoomTransition, pendingSessionCodeChange])

  const validation = useMemo(() => charadesModule.validateSetup(setupState), [setupState])

  const helpers: CharadesSetupHelpers = useMemo(
    () => ({
      categories: allCategories,
      DeviceListener,
      isPairingModalOpen: setupUi.isPairingModalOpen,
      onDisconnectDevice: () => {
        requestCharadesRoomTransition('disconnect-devices', true)
      },
      onRegenerateSessionCode: () => {
        requestCharadesRoomTransition('session-code-change', false)
      },
      openPairingModal: () => {
        updateSetupUi((current) => ({
          showSetup: true,
          isPairingModalOpen: true,
        }))
      },
      closePairingModal: () => {
        updateSetupUi((current) => ({
          ...current,
          isPairingModalOpen: false,
        }))
      },
      hasCategoryAccess,
      redeemActivationCode: async (code: string) => {
        await redeemActivationCode(code)
      },
    }),
    [hasCategoryAccess, redeemActivationCode, requestCharadesRoomTransition, setupUi.isPairingModalOpen, updateSetupUi],
  )

  const sections = charadesModule.setupSections.map((section: (typeof charadesModule.setupSections)[number]) => {
    const SectionComponent = section.render

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      className: section.className,
      unstyled: section.unstyled,
      content: (
        <SectionComponent
          state={setupState}
          updateState={(recipe: (current: CharadesSetupState) => CharadesSetupState) => setSetupState((current) => recipe(current))}
          validation={validation}
          helpers={helpers}
        />
      ),
    }
  })

  function getActivePoolStats() {
    const accessibleCategories = allCategories.filter((category) => hasCategoryAccess(category.id))
    const prompts = buildPromptPool(accessibleCategories, setupState.selectedCategories)
    const usedPromptKeys = new Set(readCharadesWordHistory()?.usedPrompts ?? [])

    return {
      remaining: getRemainingUniqueWordCount(prompts, usedPromptKeys),
      total: getTotalUniqueWordCount(prompts),
    }
  }

  function startGame() {
    sessionStorage.setItem(
      'charades:config',
      JSON.stringify({
        players: setupState.players,
        selectedCategories: setupState.selectedCategories,
        settings: setupState.settings,
        roomId: setupState.roomId,
      }),
    )
    router.push('/games/charades/play')
  }

  function handleStart() {
    if (!validation.canStart) {
      return
    }

    const demand = setupState.players.length * setupState.settings.rounds
    const poolStats = getActivePoolStats()

    if (poolStats.remaining < demand || poolStats.total < demand) {
      setWarningFocus('start')
      setStartWarning({
        remaining: poolStats.remaining,
        total: poolStats.total,
        demand,
      })
      return
    }

    startGame()
  }

  useMenuControls({
    enabled: setupUi.showSetup && startWarning === null,
    onAction: (action) => {
      if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
        setSetupFocus((current) => (current === 'start' ? 'close' : 'start'))
        return
      }

      if (action === 'back' || action === 'secondary' || action === 'menu') {
        setSetupFocus('close')
        return
      }

      if (action === 'confirm' || action === 'primary') {
        if (setupFocus === 'close') {
          updateSetupUi({
            showSetup: false,
            isPairingModalOpen: false,
          })
          return
        }

        handleStart()
      }
    },
  })

  useMenuControls({
    enabled: startWarning !== null,
    onAction: (action) => {
      if (action === 'left') {
        setWarningFocus((current) => (current === 'start' ? 'manage' : current === 'manage' ? 'back' : 'start'))
        return
      }

      if (action === 'right') {
        setWarningFocus((current) => (current === 'back' ? 'manage' : current === 'manage' ? 'start' : 'back'))
        return
      }

      if (action === 'back' || action === 'secondary' || action === 'menu') {
        setStartWarning(null)
        return
      }

      if (action === 'confirm' || action === 'primary') {
        if (warningFocus === 'back') {
          setStartWarning(null)
          return
        }

        if (warningFocus === 'manage') {
          setStartWarning(null)
          openCharadesPoolManager()
          return
        }

        setStartWarning(null)
        startGame()
      }
    },
  })

  return (
    <>
      {isSetupReady && setupState.roomId.trim().length > 0 ? (
        <DeviceListener
          roomId={setupState.roomId}
          pendingDeviceAction={pendingSessionCodeChange}
          onDeviceActionSent={(action) => {
            if (
              !pendingSessionCodeChange ||
              pendingSessionCodeChange.type !== action.type ||
              pendingSessionCodeChange.nextRoomId !== action.nextRoomId
            ) {
              return
            }

            applyCharadesRoomTransition(pendingSessionCodeChange)
          }}
          onConnect={() => {
            setSetupState((current) => ({ ...current, isDeviceConnected: true }))
          }}
          onDisconnect={() => {
            setSetupState((current) => ({ ...current, isDeviceConnected: false }))
          }}
        />
      ) : null}

      <CharadesMenuContent
        activeView={activeMenuView}
        controlsEnabled={!setupUi.showSetup && startWarning === null && menuFocusArea === 'content' && isHostInputAwake && !isControllerWakeGuardActive}
        isContentFocused={menuFocusArea === 'content' && isHostInputAwake}
        onChangeView={requestMenuViewChange}
        registerSettingsExitGuard={registerSettingsExitGuard}
        onCommitViewChange={commitMenuViewChange}
        onSettingsModalOpenChange={setIsSettingsModalOpen}
        onSettingsDirtyChange={setHasUnsavedSettingsChanges}
        onFocusRail={() => {
          setRailFocusedHref(activeMenuView === 'settings' ? '/games/charades/settings' : railFocusedHref)
          setMenuFocusArea('rail')
          setIsRailForcedExpanded(true)
        }}
        onWakeHostFocus={(device) => {
          wakeHostInput(device ?? 'keyboard')
          setIsRailForcedExpanded(false)
        }}
        onSleepHostFocus={() => {
          sleepHostInput()
        }}
        isHostInputAwake={isHostInputAwake}
        onOpenSetup={() => {
          requestMenuViewChange('mode')
          wakeHostInput('keyboard')
          setMenuFocusArea('content')
          setIsRailForcedExpanded(false)
          setSetupFocus('start')
          updateSetupUi({
            showSetup: true,
            isPairingModalOpen: false,
          })
        }}
      />

      {setupUi.showSetup ? (
        <GameSetupTemplate
          title="Kalambury"
          subtitle="Konfiguracja meczu"
          sections={sections}
          validation={validation}
          onStart={handleStart}
          onClose={() =>
            updateSetupUi({
              showSetup: false,
              isPairingModalOpen: false,
            })}
          isFocusVisible={isHostInputAwake}
          startLabel="Rozpocznij grę"
          focusedAction={setupFocus}
        />
      ) : null}

      {startWarning ? (
        <div className={styles.warningOverlay} role="presentation" onClick={() => setStartWarning(null)}>
          <div
            className={styles.warningModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="charades-start-warning-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.warningHero}>
              <div className={styles.warningEyebrow}>Niski stan puli</div>
              <h3 id="charades-start-warning-title" className={styles.warningTitle}>
                Ta gra może zużyć całą aktywną pulę
              </h3>
              <p className={styles.warningText}>
                Zostało <strong>{startWarning.remaining}</strong> unikalnych haseł w aktywnej puli. Przy tej konfiguracji
                w trakcie gry pula może się zresetować, więc część haseł wróci do użycia.
              </p>
            </div>

            <div className={styles.warningStats}>
              <div className={styles.warningStatCard}>
                <span className={styles.warningStatLabel}>Aktywna pula</span>
                <strong className={styles.warningStatValue}>
                  {startWarning.remaining}/{startWarning.total}
                </strong>
              </div>
              <div className={styles.warningStatCard}>
                <span className={styles.warningStatLabel}>Zapotrzebowanie gry</span>
                <strong className={styles.warningStatValue}>{startWarning.demand}</strong>
              </div>
            </div>

            <div className={styles.warningActions}>
              <button
                type="button"
                className={warningFocus === 'back' ? `${styles.warningButton} ${styles.focusedAction}` : styles.warningButton}
                onClick={() => setStartWarning(null)}
              >
                Wróć
              </button>
              <button
                type="button"
                className={warningFocus === 'manage' ? `${styles.warningButton} ${styles.focusedAction}` : styles.warningButton}
                onClick={() => {
                  setStartWarning(null)
                  openCharadesPoolManager()
                }}
              >
                Zarządzaj pulą unikalnych haseł
              </button>
              <button
                type="button"
                className={warningFocus === 'start' ? `${styles.warningPrimaryButton} ${styles.focusedAction}` : styles.warningPrimaryButton}
                onClick={() => {
                  setStartWarning(null)
                  startGame()
                }}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState, useEffect, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  appendPoolValidationError,
  getCodenamesBalancedPoolError,
  getCodenamesCategoryPoolSummaries,
  getCodenamesPoolSummary,
  codenamesModule,
  CodenamesMenuContent,
  useMenuControls,
  CodenameCaptainListener,
  CODENAMES_SETUP_STORAGE_KEY,
  readCodenamesWordHistory,
  resetCodenamesCategoryHistories,
  resetCodenamesPoolHistory,
  restoreCodenamesSetupState,
  serializeCodenamesSetupState,
  getCaptainConnectionState,
  shouldKeepCaptainListenerActive,
  writeCodenamesWordHistory,
  type CodenamesSetupHelpers,
  type CodenamesSetupState,
} from '@party/codenames'
import { codenamesCategories } from '@content/codenames/index'
import { GameSetupTemplate } from '@party/ui'
import { useCodenamesMenuView } from './menu-view-context'

const CaptainListener = dynamic(async () => CodenameCaptainListener, { ssr: false })

type SetupFocusTarget = 'close' | 'start'

function getBalancedCategoryIds(selectedCategories: Record<string, true>) {
  const selectedIds = Object.keys(selectedCategories)
  return selectedIds.length === 2 ? selectedIds.sort() : null
}

function haveSameSelectedCategories(left: Record<string, true>, right: Record<string, true>) {
  const leftIds = Object.keys(left)
  const rightIds = Object.keys(right)

  if (leftIds.length !== rightIds.length) {
    return false
  }

  return leftIds.every((categoryId) => right[categoryId])
}

function normalizeSetupState(
  current: CodenamesSetupState,
  next: CodenamesSetupState,
): CodenamesSetupState {
  if (haveSameSelectedCategories(current.selectedCategories, next.selectedCategories)) {
    return next
  }

  const balancedCategoryIds = getBalancedCategoryIds(next.selectedCategories)

  if (!balancedCategoryIds) {
    return {
      ...next,
      categoryBalance: null,
    }
  }

  const [leftCategoryId, rightCategoryId] = balancedCategoryIds
  const hasSamePair =
    current.categoryBalance?.leftCategoryId === leftCategoryId &&
    current.categoryBalance?.rightCategoryId === rightCategoryId

  return {
    ...next,
    categoryBalance: hasSamePair
      ? current.categoryBalance
      : {
          leftCategoryId,
          rightCategoryId,
          leftSharePercent: 50,
        },
  }
}

export function CodenamesMenuPageClient() {
  const router = useRouter()
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
  } = useCodenamesMenuView()

  const [showSetup, setShowSetup] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [setupState, setSetupState] = useState<CodenamesSetupState>(() => codenamesModule.createInitialSetupState())
  const [captainConnections, setCaptainConnections] = useState(() =>
    getCaptainConnectionState({
      captainRedConnected: false,
      captainBlueConnected: false,
    }),
  )
  const [hasRestoredSetup, setHasRestoredSetup] = useState(false)
  const [setupFocus, setSetupFocus] = useState<SetupFocusTarget>('start')
  const runtimeSetupState = useMemo(
    () => ({
      ...setupState,
      ...captainConnections,
    }),
    [captainConnections, setupState],
  )

  const wordHistory = useMemo(
    () => (hasRestoredSetup ? readCodenamesWordHistory() : null),
    [hasRestoredSetup, setupState.selectedCategories],
  )

  const poolSummary = useMemo(
    () =>
      getCodenamesPoolSummary({
        categories: codenamesCategories,
        selectedCategories: setupState.selectedCategories,
        history: wordHistory,
      }),
    [setupState.selectedCategories, wordHistory],
  )

  const categoryPoolSummaries = useMemo(
    () =>
      getCodenamesCategoryPoolSummaries({
        categories: codenamesCategories,
        selectedCategories: setupState.selectedCategories,
        history: wordHistory,
      }),
    [setupState.selectedCategories, wordHistory],
  )

  const validation = useMemo(() => {
    const baseValidation = codenamesModule.validateSetup(runtimeSetupState)
    const poolErrors = appendPoolValidationError({
      errors: baseValidation.errors ?? [],
      summary: poolSummary,
    })
    const balancedPoolError = getCodenamesBalancedPoolError({
      categorySummaries: categoryPoolSummaries,
      selectedCategories: runtimeSetupState.selectedCategories,
      categoryBalance: runtimeSetupState.categoryBalance,
    })
    const errors = balancedPoolError ? [...poolErrors, balancedPoolError] : poolErrors

    return {
      canStart: errors.length === 0,
      errors,
    }
  }, [categoryPoolSummaries, poolSummary, runtimeSetupState])

  const helpers: CodenamesSetupHelpers = useMemo(
    () => ({
      categories: codenamesCategories,
      categoryPoolSummaries,
      CaptainListener,
      poolSummary,
      resetActivePoolHistory: () => {
        const activeCategoryIds = Object.keys(setupState.selectedCategories)

        if (activeCategoryIds.length === 0) {
          return
        }

        writeCodenamesWordHistory(
          resetCodenamesCategoryHistories({
            history: readCodenamesWordHistory(),
            categoryIds: activeCategoryIds,
          }),
        )
        setSetupState((current) => ({
          ...current,
          selectedCategories: { ...current.selectedCategories },
        }))
      },
      resetCategoryPoolHistory: (categoryId: string) => {
        writeCodenamesWordHistory(
          resetCodenamesPoolHistory({
            history: readCodenamesWordHistory(),
            poolKey: categoryId,
          }),
        )
        setSetupState((current) => ({
          ...current,
          selectedCategories: { ...current.selectedCategories },
        }))
      },
    }),
    [categoryPoolSummaries, poolSummary, setupState.selectedCategories],
  )

  useEffect(() => {
    setSetupState(restoreCodenamesSetupState(window.localStorage.getItem(CODENAMES_SETUP_STORAGE_KEY)))
    setHasRestoredSetup(true)
  }, [])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const shouldShowSetup = new URLSearchParams(window.location.search).get('setup') === '1'

    if (shouldShowSetup) {
      setShowSetup(true)
      requestMenuViewChange('mode')
    }
  }, [requestMenuViewChange])

  useEffect(() => {
    setCaptainConnections({
      captainRedConnected: false,
      captainBlueConnected: false,
    })
  }, [setupState.roomId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(window.location.href)

    if (showSetup) {
      url.searchParams.set('setup', '1')
    } else {
      url.searchParams.delete('setup')
    }

    window.history.replaceState(window.history.state, '', url)
  }, [showSetup])

  useEffect(() => {
    setIsMenuInputSuspended(showSetup || isSettingsModalOpen)
    return () => setIsMenuInputSuspended(false)
  }, [isSettingsModalOpen, setIsMenuInputSuspended, showSetup])

  useEffect(() => {
    if (!hasRestoredSetup) {
      return
    }

    window.localStorage.setItem(CODENAMES_SETUP_STORAGE_KEY, serializeCodenamesSetupState(setupState))
  }, [hasRestoredSetup, setupState])

  const startGameFromSetup = () => {
    if (!validation.canStart) return

    sessionStorage.setItem(
      'codenames:config',
      JSON.stringify({
        roomId: setupState.roomId,
        selectedCategories: setupState.selectedCategories,
        settings: setupState.settings,
        teams: setupState.teams,
        categoryBalance: setupState.categoryBalance,
      }),
    )
    router.push(`/games/codenames/play?room=${setupState.roomId}`)
  }

  const sections = codenamesModule.setupSections.map((section: (typeof codenamesModule.setupSections)[number]) => {
    const SectionComponent = section.render

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      className: section.className,
      unstyled: section.unstyled,
      content: (
        <SectionComponent
          state={runtimeSetupState}
          updateState={(recipe: (current: CodenamesSetupState) => CodenamesSetupState) =>
            setSetupState((current) => normalizeSetupState(current, recipe(current)))
          }
          validation={validation}
          helpers={helpers}
        />
      ),
    }
  })

  useMenuControls({
    enabled: showSetup,
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
          setShowSetup(false)
          return
        }

        if (validation.canStart) {
          startGameFromSetup()
        }
      }
    },
  })

  const isCaptainListenerActive = shouldKeepCaptainListenerActive({
    hasRestoredSetup,
    roomId: setupState.roomId,
  })

  return (
    <>
      {isCaptainListenerActive ? (
        <CaptainListener
          roomId={setupState.roomId}
          teams={setupState.teams}
          onConnectionStateChange={(next) =>
            setCaptainConnections((current) => ({
              captainRedConnected:
                typeof next.captainRedConnected === 'boolean' ? next.captainRedConnected : current.captainRedConnected,
              captainBlueConnected:
                typeof next.captainBlueConnected === 'boolean' ? next.captainBlueConnected : current.captainBlueConnected,
            }))
          }
        />
      ) : null}

      <CodenamesMenuContent
        activeView={activeMenuView}
        controlsEnabled={!showSetup && menuFocusArea === 'content' && isHostInputAwake && !isControllerWakeGuardActive}
        isContentFocused={menuFocusArea === 'content' && isHostInputAwake}
        onChangeView={requestMenuViewChange}
        registerSettingsExitGuard={registerSettingsExitGuard}
        onCommitViewChange={commitMenuViewChange}
        onSettingsModalOpenChange={setIsSettingsModalOpen}
        onSettingsDirtyChange={setHasUnsavedSettingsChanges}
        onFocusRail={() => {
          setRailFocusedHref(activeMenuView === 'settings' ? '/games/codenames/settings' : railFocusedHref)
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
          setShowSetup(true)
        }}
      />

      {showSetup ? (
        <GameSetupTemplate
          title="Tajniacy"
          subtitle="Konfiguracja meczu"
          sections={sections}
          validation={validation}
          onStart={startGameFromSetup}
          onClose={() => setShowSetup(false)}
          isFocusVisible={isHostInputAwake}
          startLabel="Zagraj"
          focusedAction={setupFocus}
        />
      ) : null}
    </>
  )
}

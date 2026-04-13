'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  codenamesModule,
  CodenamesMenuContent,
  useMenuControls,
  type CodenamesSetupHelpers,
  type CodenamesSetupState,
} from '@party/codenames'
import { codenamesCategories } from '@content/codenames/index'
import { GameSetupTemplate } from '@party/ui'
import { useCodenamesMenuView } from './menu-view-context'

type SetupFocusTarget = 'close' | 'start'

export default function CodenamesMenuPage() {
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
  const [setupFocus, setSetupFocus] = useState<SetupFocusTarget>('start')

  const validation = useMemo(() => codenamesModule.validateSetup(setupState), [setupState])

  const helpers: CodenamesSetupHelpers = useMemo(
    () => ({
      categories: codenamesCategories,
    }),
    [],
  )

  useEffect(() => {
    setIsMenuInputSuspended(showSetup || isSettingsModalOpen)
    return () => setIsMenuInputSuspended(false)
  }, [isSettingsModalOpen, setIsMenuInputSuspended, showSetup])

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
          state={setupState}
          updateState={(recipe: (current: CodenamesSetupState) => CodenamesSetupState) => setSetupState((current) => recipe(current))}
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
        setShowSetup(false)
        return
      }

      if (action === 'confirm' || action === 'primary') {
        if (setupFocus === 'close') {
          setShowSetup(false)
          return
        }

        if (validation.canStart) {
          setShowSetup(false)
        }
      }
    },
  })

  return (
    <>
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
          onStart={() => setShowSetup(false)}
          onClose={() => setShowSetup(false)}
          isFocusVisible={isHostInputAwake}
          startLabel="Zagraj"
          focusedAction={setupFocus}
        />
      ) : null}
    </>
  )
}

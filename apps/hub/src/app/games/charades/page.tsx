'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  charadesModule,
  CharadesDeviceListener,
  type CharadesSetupHelpers,
  type CharadesSetupState,
  clearPresenterSession,
  ensureCharadesWordHistorySession,
  startNewCharadesWordHistorySession,
  createCharadesRoomId,
  isPresenterSessionFresh,
  normalizeCharadesSettings,
  readCharadesSetup,
  readPresenterSession,
  writeCharadesSetup,
} from '@party/charades'
import { GameSetupTemplate } from '@party/ui'
import { allCategories } from '@content/charades/index'

const DeviceListener = dynamic(
  async () => CharadesDeviceListener,
  { ssr: false },
)

export default function CharadesMenuPage() {
  const router = useRouter()
  const [showSetup, setShowSetup] = useState(false)
  const [isSetupReady, setIsSetupReady] = useState(false)
  const [setupState, setSetupState] = useState<CharadesSetupState>(() => charadesModule.createInitialSetupState())

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
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('setup') === '1') {
      setShowSetup(true)
    }
  }, [])

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

  const validation = useMemo(() => charadesModule.validateSetup(setupState), [setupState])

  const helpers: CharadesSetupHelpers = useMemo(() => ({
    categories: allCategories,
    DeviceListener,
    onDisconnectDevice: () => {
      clearPresenterSession()
      startNewCharadesWordHistorySession()
      setSetupState((current) => ({
        ...current,
        roomId: createCharadesRoomId(),
        isDeviceConnected: false,
      }))
    },
  }), [])

  const sections = charadesModule.setupSections.map((section) => {
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
          updateState={(recipe) => setSetupState((current) => recipe(current))}
          validation={validation}
          helpers={helpers}
        />
      ),
    }
  })

  function handleStart() {
    if (!validation.canStart) {
      return
    }

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

  return (
    <>
      <charadesModule.GameMenuContent onOpenSetup={() => setShowSetup(true)} />

      {showSetup ? (
        <GameSetupTemplate
          title="Kalambury"
          subtitle="Konfiguracja meczu"
          sections={sections}
          validation={validation}
          onStart={handleStart}
          onClose={() => setShowSetup(false)}
          startLabel="Rozpocznij grę"
        />
      ) : null}
    </>
  )
}

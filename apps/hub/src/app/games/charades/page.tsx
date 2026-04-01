'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  buildPromptPool,
  charadesModule,
  CharadesDeviceListener,
  clearPresenterSession,
  createCharadesRoomId,
  ensureCharadesWordHistorySession,
  getRemainingUniqueWordCount,
  getTotalUniqueWordCount,
  isPresenterSessionFresh,
  normalizeCharadesSettings,
  openCharadesPoolManager,
  readCharadesSetup,
  readCharadesWordHistory,
  readPresenterSession,
  startNewCharadesWordHistorySession,
  writeCharadesSetup,
  type CharadesSetupHelpers,
  type CharadesSetupState,
} from '@party/charades'
import { GameSetupTemplate } from '@party/ui'
import { allCategories } from '@content/charades/index'
import styles from './page.module.css'

const DeviceListener = dynamic(async () => CharadesDeviceListener, { ssr: false })

type StartWarningState = {
  remaining: number
  total: number
  demand: number
}

export default function CharadesMenuPage() {
  const router = useRouter()
  const [showSetup, setShowSetup] = useState(false)
  const [isSetupReady, setIsSetupReady] = useState(false)
  const [setupState, setSetupState] = useState<CharadesSetupState>(() => charadesModule.createInitialSetupState())
  const [startWarning, setStartWarning] = useState<StartWarningState | null>(null)

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

  const helpers: CharadesSetupHelpers = useMemo(
    () => ({
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
    }),
    [],
  )

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

  function getActivePoolStats() {
    const prompts = buildPromptPool(allCategories, setupState.selectedCategories)
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
      setStartWarning({
        remaining: poolStats.remaining,
        total: poolStats.total,
        demand,
      })
      return
    }

    startGame()
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
              <button type="button" className={styles.warningButton} onClick={() => setStartWarning(null)}>
                Wróć
              </button>
              <button
                type="button"
                className={styles.warningButton}
                onClick={() => {
                  setStartWarning(null)
                  openCharadesPoolManager()
                }}
              >
                Zarządzaj pulą unikalnych haseł
              </button>
              <button
                type="button"
                className={styles.warningPrimaryButton}
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

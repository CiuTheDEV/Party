'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { allCategories } from '@content/charades/index'
import {
  ensureCharadesWordHistorySession,
  HostGameScreen,
  normalizeCharadesPlayers,
  useGameState,
  useWordPool,
  type Player,
  type GameSettings,
} from '@party/charades'
import styles from './page.module.css'

type Config = {
  players: Omit<Player, 'score'>[]
  selectedCategories: Record<string, ('easy' | 'hard')[]>
  settings: GameSettings
  roomId: string
}

export default function CharadesPlayPage() {
  const router = useRouter()
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('charades:config')
    if (!raw) {
      router.replace('/games/charades')
      return
    }
    const parsed = JSON.parse(raw) as Config
    setConfig({
      ...parsed,
      players: normalizeCharadesPlayers(parsed.players),
    })
  }, [router])

  if (!config) return null
  return <PlayScreen config={config} />
}

function PlayScreen({ config }: { config: Config }) {
  const router = useRouter()
  const cats = useMemo(
    () => allCategories.filter((c) => c.id in config.selectedCategories),
    [config.selectedCategories],
  )
  useEffect(() => {
    ensureCharadesWordHistorySession()
  }, [])
  const { selectInitialCandidate, rerollWordOnly, rerollWordAndCategory, recordRejectedPrompt, commitPrompt } = useWordPool(
    cats,
    config.selectedCategories,
  )

  const {
    state,
    startRound,
    finishRoundOrder,
    finishRoundSummary,
    giveVerdict,
    stopRoundEarly,
    pausePhaseTimer,
    resumePhaseTimer,
    isGameOver,
  } = useGameState(
    config.roomId,
    config.players.map((p) => ({ ...p, score: 0 })),
    config.settings,
    selectInitialCandidate,
    rerollWordOnly,
    rerollWordAndCategory,
    recordRejectedPrompt,
    commitPrompt,
  )

  useEffect(() => {
    if (isGameOver) {
      sessionStorage.setItem('charades:results', JSON.stringify(state.players))
      router.push('/games/charades/results')
    }
  }, [isGameOver, state.players, router])

  useEffect(() => {
    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const currentUrl = window.location.href
    window.history.pushState({ guard: 'charades-play' }, '', currentUrl)

    const popStateHandler = () => {
      const shouldLeave = window.confirm('Halo, gra trwa. Pójście wstecz utraci postęp.')

      if (shouldLeave) {
        window.removeEventListener('beforeunload', beforeUnloadHandler)
        router.push('/games/charades')
        return
      }

      window.history.pushState({ guard: 'charades-play' }, '', currentUrl)
    }

    window.addEventListener('beforeunload', beforeUnloadHandler)
    window.addEventListener('popstate', popStateHandler)

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      window.removeEventListener('popstate', popStateHandler)
    }
  }, [router])

  const presenterIdx = state.order[state.currentOrderIdx]
  const presenter = state.players[presenterIdx]

  if (isGameOver) {
    return <div className={styles.screen} aria-hidden="true" />
  }

  return (
    <div className={styles.screen}>
      <HostGameScreen
        currentOrderIdx={state.currentOrderIdx}
        currentRound={state.currentRound}
        currentWord={state.currentWord}
        currentCategory={state.currentCategory}
        isDeviceConnected={state.isDeviceConnected}
        isRoomConnected={state.isRoomConnected}
        isRoundOrderRevealing={state.isRoundOrderRevealing}
        onFinishRoundOrder={finishRoundOrder}
        onFinishRoundSummary={finishRoundSummary}
        onGiveVerdict={giveVerdict}
        onExitToMenu={() => router.push('/games/charades')}
        onPauseGame={pausePhaseTimer}
        onResumeGame={resumePhaseTimer}
        onStopRound={stopRoundEarly}
        onStartRound={startRound}
        order={state.order}
        phase={state.phase}
        players={state.players}
        presenter={presenter}
        roomId={config.roomId}
        settings={config.settings}
        bufferRemaining={state.bufferRemaining}
        timerRemaining={state.timerRemaining}
        totalRounds={state.totalRounds}
      />
    </div>
  )
}

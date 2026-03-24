'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { allCategories } from '@content/charades/index'
import { HostGameScreen } from '../../../../components/charades/play/HostGameScreen'
import { useWordPool } from '../../../../hooks/charades/useWordPool'
import { useGameState } from '../../../../hooks/charades/useGameState'
import type { Player, GameSettings } from '../../../../hooks/charades/useGameState'
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
    setConfig(JSON.parse(raw))
  }, [router])

  if (!config) return null
  return <PlayScreen config={config} />
}

function PlayScreen({ config }: { config: Config }) {
  const router = useRouter()
  const cats = allCategories.filter((c) => c.id in config.selectedCategories)
  const { nextWord } = useWordPool(cats, config.selectedCategories)

  const getNextWord = useCallback(() => {
    const word = nextWord()
    const cat = cats.find((c) => c.wordsEasy.includes(word) || c.wordsHard.includes(word))?.name ?? ''
    return { word, category: cat }
  }, [nextWord, cats])

  const { state, startRound, finishRoundOrder, finishRoundSummary, giveVerdict, stopRoundEarly, isGameOver } = useGameState(
    config.roomId,
    config.players.map((p) => ({ ...p, score: 0 })),
    config.settings,
    getNextWord,
  )

  useEffect(() => {
    if (isGameOver) {
      sessionStorage.setItem('charades:results', JSON.stringify(state.players))
      router.push('/games/charades/results')
    }
  }, [isGameOver, state.players, router])

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
        isDeviceConnected={state.isDeviceConnected}
        isRoundOrderRevealing={state.isRoundOrderRevealing}
        onFinishRoundOrder={finishRoundOrder}
        onFinishRoundSummary={finishRoundSummary}
        onGiveVerdict={giveVerdict}
        onExitToMenu={() => router.push('/games/charades')}
        onStopRound={stopRoundEarly}
        onStartRound={startRound}
        order={state.order}
        phase={state.phase}
        players={state.players}
        presenter={presenter}
        bufferRemaining={state.bufferRemaining}
        timerRemaining={state.timerRemaining}
        totalRounds={state.totalRounds}
      />
    </div>
  )
}

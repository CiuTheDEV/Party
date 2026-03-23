'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { allCategories } from '@content/charades/index'
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
    if (!raw) { router.replace('/games/charades'); return }
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

  const { state, sendWord, giveVerdict, isGameOver } = useGameState(
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
  const pronouns: Record<string, string> = {
    on: 'pokazuje on',
    ona: 'pokazuje ona',
    none: `pokazuje ${presenter?.name ?? ''}`,
  }
  const label = pronouns[presenter?.gender ?? 'none']

  return (
    <div className={styles.screen}>
      <header className={styles.topbar}>
        <span className={styles.gameName}>🎭 Kalambury</span>
        <span className={styles.round}>Runda {state.currentRound}/{state.totalRounds}</span>
        <div className={styles.scores}>
          {state.players.map((p) => (
            <span key={p.name} className={styles.score}>
              {p.avatar} {p.score}
            </span>
          ))}
        </div>
        <span className={styles.deviceStatus}>
          {state.isDeviceConnected ? '📱' : '📵'}
        </span>
      </header>

      <main className={styles.main}>
        <div className={styles.presenterInfo}>
          <span className={styles.presenterAvatar}>{presenter?.avatar}</span>
          <span className={styles.presenterName}>{presenter?.name}</span>
          <span className={styles.presenterLabel}>{label}</span>
        </div>

        {state.phase === 'idle' && (
          <button className={styles.primaryBtn} onClick={sendWord}>
            Wyślij hasło na telefon
          </button>
        )}

        {state.phase === 'waiting-ready' && (
          <p className={styles.waitingText}>⏳ Czekam aż prezenter kliknie „Gotowy"…</p>
        )}

        {state.phase === 'timer-running' && (
          <div className={styles.timer}>{state.timerRemaining}</div>
        )}

        {(state.phase === 'timer-running' || state.phase === 'verdict') && (
          <div className={styles.verdictBtns}>
            <button
              className={`${styles.verdictBtn} ${styles.correct}`}
              onClick={() => giveVerdict(true)}
            >
              Zgadnięto ✓
            </button>
            <button
              className={`${styles.verdictBtn} ${styles.wrong}`}
              onClick={() => giveVerdict(false)}
            >
              Nie zgadnięto ✗
            </button>
          </div>
        )}

        {state.phase === 'between' && (
          <div className={styles.betweenView}>
            <p className={styles.betweenText}>Podaj telefon kolejnej osobie…</p>
            <button className={styles.primaryBtn} onClick={sendWord}>
              Następna tura →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { Space_Grotesk } from 'next/font/google'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { HostGameScreen } from '@party/codenames'
import { codenamesCategories } from '@content/codenames/index'

const defaultWordPool = codenamesCategories.flatMap((c) => c.words)
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

type CodenamesTeam = { name: string; avatar: string }
type CodenamesConfig = {
  selectedCategories: Record<string, true>
  teams?: [CodenamesTeam, CodenamesTeam]
  settings?: { rounds?: number }
}

const DEFAULT_TEAMS: [CodenamesTeam, CodenamesTeam] = [
  { name: 'Czerwoni', avatar: 'star' },
  { name: 'Niebiescy', avatar: 'moon' },
]

function readConfig(): { wordPool: string[]; teams: [CodenamesTeam, CodenamesTeam]; roundsToWin: number } {
  try {
    const raw = sessionStorage.getItem('codenames:config')
    if (!raw) return { wordPool: defaultWordPool, teams: DEFAULT_TEAMS, roundsToWin: 3 }
    const config = JSON.parse(raw) as CodenamesConfig
    const selected = Object.keys(config.selectedCategories ?? {})
    const wordPool = selected.length === 0
      ? defaultWordPool
      : codenamesCategories.filter((c) => selected.includes(c.id)).flatMap((c) => c.words)
    return { wordPool, teams: config.teams ?? DEFAULT_TEAMS, roundsToWin: config.settings?.rounds ?? 3 }
  } catch {
    return { wordPool: defaultWordPool, teams: DEFAULT_TEAMS, roundsToWin: 3 }
  }
}

function PlayPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const [config, setConfig] = useState<{ wordPool: string[]; teams: [CodenamesTeam, CodenamesTeam]; roundsToWin: number } | null>(null)

  useEffect(() => {
    setConfig(readConfig())
  }, [])

  useEffect(() => {
    if (!roomId) {
      router.replace('/games/codenames')
    }
  }, [roomId, router])

  if (!roomId) {
    return null
  }

  if (!config) return null

  return (
    <div className={spaceGrotesk.className}>
      <HostGameScreen roomId={roomId} wordPool={config.wordPool} teams={config.teams} roundsToWin={config.roundsToWin} />
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayPageContent />
    </Suspense>
  )
}

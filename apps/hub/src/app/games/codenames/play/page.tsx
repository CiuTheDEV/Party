'use client'

import { codenamesCategories } from '@content/codenames/index'
import { HostGameScreen } from '@party/codenames'
import { Space_Grotesk } from 'next/font/google'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

type CodenamesTeam = { name: string; avatar: string }
type CodenamesCategoryBalance = {
  leftCategoryId: string
  rightCategoryId: string
  leftSharePercent: number
}
type CodenamesConfig = {
  selectedCategories: Record<string, true>
  teams?: [CodenamesTeam, CodenamesTeam]
  settings?: { rounds?: number }
  categoryBalance?: CodenamesCategoryBalance | null
}

const DEFAULT_TEAMS: [CodenamesTeam, CodenamesTeam] = [
  { name: 'Czerwoni', avatar: 'star' },
  { name: 'Niebiescy', avatar: 'moon' },
]

function getConfiguredCategories(selectedCategories: Record<string, true> | undefined) {
  const selectedIds = Object.keys(selectedCategories ?? {})
  const activeCategories =
    selectedIds.length === 0
      ? codenamesCategories
      : codenamesCategories.filter((category) => selectedIds.includes(category.id))

  return activeCategories.map((category) => ({
    id: category.id,
    words: category.words,
  }))
}

function readConfig() {
  try {
    const raw = sessionStorage.getItem('codenames:config')

    if (!raw) {
      return {
        categories: getConfiguredCategories(undefined),
        teams: DEFAULT_TEAMS,
        roundsToWin: 3,
        categoryBalance: null,
      }
    }

    const config = JSON.parse(raw) as CodenamesConfig

    return {
      categories: getConfiguredCategories(config.selectedCategories),
      teams: config.teams ?? DEFAULT_TEAMS,
      roundsToWin: config.settings?.rounds ?? 3,
      categoryBalance: config.categoryBalance ?? null,
    }
  } catch {
    return {
      categories: getConfiguredCategories(undefined),
      teams: DEFAULT_TEAMS,
      roundsToWin: 3,
      categoryBalance: null,
    }
  }
}

function PlayPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const [config, setConfig] = useState<{
    categories: Array<{ id: string; words: string[] }>
    teams: [CodenamesTeam, CodenamesTeam]
    roundsToWin: number
    categoryBalance: CodenamesCategoryBalance | null
  } | null>(null)

  useEffect(() => {
    setConfig(readConfig())
  }, [])

  useEffect(() => {
    if (!roomId) {
      router.replace('/games/codenames')
    }
  }, [roomId, router])

  if (!roomId || !config) {
    return null
  }

  return (
    <div className={spaceGrotesk.className}>
      <HostGameScreen
        roomId={roomId}
        categories={config.categories}
        teams={config.teams}
        roundsToWin={config.roundsToWin}
        categoryBalance={config.categoryBalance}
      />
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

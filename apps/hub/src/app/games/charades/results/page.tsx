'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CharadesResultsScreen, type CharadesResultPlayer } from '@party/charades'

export default function CharadesResultsPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<CharadesResultPlayer[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('charades:results')

    if (!raw) {
      router.replace('/games/charades')
      return
    }

    setPlayers(JSON.parse(raw))
  }, [router])

  function handlePlayAgain() {
    sessionStorage.removeItem('charades:results')
    router.push('/games/charades?setup=1')
  }

  function handleBackToMenu() {
    sessionStorage.removeItem('charades:config')
    sessionStorage.removeItem('charades:results')
    router.push('/games/charades')
  }

  if (players.length === 0) {
    return null
  }

  return (
    <CharadesResultsScreen
      players={players}
      onPlayAgain={handlePlayAgain}
      onBackToMenu={handleBackToMenu}
    />
  )
}

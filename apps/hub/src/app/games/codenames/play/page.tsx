'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { HostGameScreen } from '@party/codenames'
import { codenamesCategories } from '@content/codenames/index'

const defaultWordPool = codenamesCategories.flatMap((c) => c.words)

function readWordPool(): string[] {
  try {
    const raw = sessionStorage.getItem('codenames:config')
    if (!raw) return defaultWordPool
    const config = JSON.parse(raw) as { selectedCategories: Record<string, true> }
    const selected = Object.keys(config.selectedCategories)
    if (selected.length === 0) return defaultWordPool
    return codenamesCategories.filter((c) => selected.includes(c.id)).flatMap((c) => c.words)
  } catch {
    return defaultWordPool
  }
}

function PlayPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const [wordPool, setWordPool] = useState<string[] | null>(null)

  useEffect(() => {
    setWordPool(readWordPool())
  }, [])

  if (!roomId) {
    router.replace('/games/codenames')
    return null
  }

  if (!wordPool) return null

  return <HostGameScreen roomId={roomId} wordPool={wordPool} />
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayPageContent />
    </Suspense>
  )
}

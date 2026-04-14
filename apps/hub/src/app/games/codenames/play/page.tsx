'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useMemo, Suspense } from 'react'
import { HostGameScreen } from '@party/codenames'
import { codenamesCategories } from '@content/codenames/index'

function PlayPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')

  const wordPool = useMemo(() => {
    const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('codenames:config') : null
    if (!raw) return codenamesCategories.flatMap((c) => c.words)

    try {
      const config = JSON.parse(raw) as { selectedCategories: Record<string, true> }
      const selected = Object.keys(config.selectedCategories)
      if (selected.length === 0) return codenamesCategories.flatMap((c) => c.words)
      return codenamesCategories
        .filter((c) => selected.includes(c.id))
        .flatMap((c) => c.words)
    } catch {
      return codenamesCategories.flatMap((c) => c.words)
    }
  }, [])

  if (!roomId) {
    if (typeof window !== 'undefined') {
      router.replace('/games/codenames')
    }
    return null
  }

  return <HostGameScreen roomId={roomId} wordPool={wordPool} />
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayPageContent />
    </Suspense>
  )
}

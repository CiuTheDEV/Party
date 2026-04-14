'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { CaptainScreen } from '@party/codenames'

function CaptainPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const teamParam = searchParams.get('team')

  if (!roomId || (teamParam !== 'red' && teamParam !== 'blue')) {
    if (typeof window !== 'undefined') {
      router.replace('/games/codenames')
    }
    return null
  }

  return <CaptainScreen roomId={roomId} team={teamParam} />
}

export default function CaptainPage() {
  return (
    <Suspense>
      <CaptainPageContent />
    </Suspense>
  )
}

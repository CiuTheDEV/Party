'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CaptainRouteScreen } from './CaptainRouteScreen'

function LegacyCaptainPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')

  if (!roomId) {
    router.replace('/games/codenames')
    return null
  }

  return (
    <CaptainRouteScreen
      roomId={roomId}
      teamParam={searchParams.get('team')}
      redTeam={{
        name: searchParams.get('redName') ?? 'Czerwoni',
        avatar: searchParams.get('redAvatar') ?? 'star',
      }}
      blueTeam={{
        name: searchParams.get('blueName') ?? 'Niebiescy',
        avatar: searchParams.get('blueAvatar') ?? 'moon',
      }}
    />
  )
}

export default function CaptainPage() {
  return (
    <Suspense fallback={null}>
      <LegacyCaptainPageContent />
    </Suspense>
  )
}

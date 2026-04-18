'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PresentRouteScreen } from './PresentRouteScreen'

function LegacyPresentPageContent() {
  const params = useSearchParams()
  const roomId = params.get('room') ?? ''

  return <PresentRouteScreen roomId={roomId} />
}

export default function PresentPage() {
  return (
    <Suspense fallback={null}>
      <LegacyPresentPageContent />
    </Suspense>
  )
}

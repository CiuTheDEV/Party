'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PresentRouteScreen } from './PresentRouteScreen'

function readPresenterRoomId(pathname: string, searchParams: URLSearchParams) {
  const queryRoomId = searchParams.get('room')
  if (queryRoomId) {
    return queryRoomId
  }

  const match = pathname.match(/^\/games\/charades\/present\/([^/]+)\/?$/)
  if (!match) {
    return ''
  }

  return decodeURIComponent(match[1])
}

function LegacyPresentPageContent() {
  const pathname = usePathname()
  const params = useSearchParams()
  const roomId = readPresenterRoomId(pathname, params)

  return <PresentRouteScreen roomId={roomId} />
}

export default function PresentPage() {
  return (
    <Suspense fallback={null}>
      <LegacyPresentPageContent />
    </Suspense>
  )
}

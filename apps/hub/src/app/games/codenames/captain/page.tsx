'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { CaptainRouteScreen } from './CaptainRouteScreen'

function readCaptainRoomId(pathname: string, searchParams: URLSearchParams) {
  const queryRoomId = searchParams.get('room')
  if (queryRoomId) {
    return queryRoomId
  }

  const match = pathname.match(/^\/games\/codenames\/captain\/([^/]+)\/?$/)
  if (!match) {
    return ''
  }

  return decodeURIComponent(match[1])
}

function LegacyCaptainPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const roomId = readCaptainRoomId(pathname, searchParams)

  useEffect(() => {
    if (!roomId) {
      router.replace('/games/codenames')
    }
  }, [roomId, router])

  if (!roomId) {
    return null
  }

  return (
    <CaptainRouteScreen
      roomId={roomId}
      teamParam={searchParams.get('team')}
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

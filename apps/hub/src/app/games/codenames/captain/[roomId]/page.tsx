'use client'

import { useSearchParams } from 'next/navigation'
import { use } from 'react'
import { CaptainRouteScreen } from '../CaptainRouteScreen'

export default function CaptainRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const searchParams = useSearchParams()

  return <CaptainRouteScreen roomId={decodeURIComponent(roomId)} teamParam={searchParams.get('team')} />
}

'use client'

import { use } from 'react'
import { PresentRouteScreen } from '../PresentRouteScreen'

export default function PresentRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)

  return <PresentRouteScreen roomId={decodeURIComponent(roomId)} />
}

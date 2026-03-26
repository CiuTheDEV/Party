'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PresenterScreen } from '../../../../components/charades/presenter/PresenterScreen'
import { usePresenter } from '../../../../hooks/charades/usePresenter'
import styles from './page.module.css'

export default function PresentPage() {
  return (
    <Suspense fallback={<RouteStatus eyebrow="Prezenter" message="Laczenie..." />}>
      <PresentRoute />
    </Suspense>
  )
}

function PresentRoute() {
  const params = useSearchParams()
  const roomId = params.get('room') ?? ''

  if (!roomId) {
    return <RouteStatus eyebrow="Brak pokoju" message="Zeskanuj QR ponownie, aby otworzyc ekran prezentera." />
  }

  return <PresenterRouteContent roomId={roomId} />
}

function PresenterRouteContent({ roomId }: { roomId: string }) {
  const { state, revealWord } = usePresenter(roomId)

  return <PresenterScreen state={state} onRevealWord={revealWord} />
}

function RouteStatus({ eyebrow, message }: { eyebrow: string; message: string }) {
  return (
    <div className={styles.statusScreen}>
      <div className={styles.statusCard}>
        <p className={styles.statusEyebrow}>{eyebrow}</p>
        <p className={styles.statusMessage}>{message}</p>
      </div>
    </div>
  )
}

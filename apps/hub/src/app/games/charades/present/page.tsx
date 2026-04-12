'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PresenterScreen, usePresenter } from '@party/charades'
import styles from './page.module.css'

export default function PresentPage() {
  return (
    <div className={styles.routeShell}>
      <Suspense fallback={<RouteStatus eyebrow="Prezenter" message="Łączenie..." />}>
        <PresentRoute />
      </Suspense>
    </div>
  )
}

function PresentRoute() {
  const params = useSearchParams()
  const roomId = params.get('room') ?? ''

  if (!roomId) {
    return <RouteStatus eyebrow="Brak pokoju" message="Zeskanuj QR ponownie, aby otworzyć ekran prezentera." />
  }

  return <PresenterRouteContent roomId={roomId} />
}

function PresenterRouteContent({ roomId }: { roomId: string }) {
  const { state, connectionState, hasSyncedState, revealWord, changeWord } = usePresenter(roomId)

  if (!hasSyncedState && connectionState !== 'connected') {
    return (
      <RouteStatus
        eyebrow={connectionState === 'error' ? 'Problem z połączeniem' : 'Prezenter'}
        message={
          connectionState === 'error'
            ? 'Nie udało się połączyć z pokojem. Odśwież ekran prezentera albo zeskanuj QR ponownie.'
            : 'Łączenie z pokojem gry...'
        }
      />
    )
  }

  return (
    <PresenterScreen
      state={state}
      connectionState={connectionState}
      onRevealWord={revealWord}
      onChangeWord={changeWord}
    />
  )
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

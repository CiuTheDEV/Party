'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { PresenterScreen, usePresenter } from '@party/charades'
import styles from './page.module.css'

export default function PresentPage() {
  const [viewportHeight, setViewportHeight] = useState('100dvh')

  useEffect(() => {
    let frameId = 0

    const applyViewportHeight = () => {
      const nextHeight = window.visualViewport?.height ?? window.innerHeight
      setViewportHeight(`${Math.round(nextHeight)}px`)
    }

    const scheduleViewportHeight = () => {
      cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        applyViewportHeight()
      })
    }

    scheduleViewportHeight()

    window.addEventListener('resize', scheduleViewportHeight)
    window.addEventListener('orientationchange', scheduleViewportHeight)
    window.visualViewport?.addEventListener('resize', scheduleViewportHeight)
    window.visualViewport?.addEventListener('scroll', scheduleViewportHeight)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', scheduleViewportHeight)
      window.removeEventListener('orientationchange', scheduleViewportHeight)
      window.visualViewport?.removeEventListener('resize', scheduleViewportHeight)
      window.visualViewport?.removeEventListener('scroll', scheduleViewportHeight)
    }
  }, [])

  return (
    <div className={styles.routeShell} style={{ '--presenter-viewport-height': viewportHeight } as React.CSSProperties}>
      <Suspense fallback={<RouteStatus eyebrow="Prezenter" message="Łączenie..." />}>
        <PresentRoute />
      </Suspense>
    </div>
  )
}

function PresentRoute() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverscroll = html.style.overscrollBehavior
    const previousBodyOverscroll = body.style.overscrollBehavior
    const previousHtmlHeight = html.style.height
    const previousBodyHeight = body.style.height

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overscrollBehavior = 'none'
    html.style.height = '100%'
    body.style.height = '100%'

    return () => {
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      html.style.overscrollBehavior = previousHtmlOverscroll
      body.style.overscrollBehavior = previousBodyOverscroll
      html.style.height = previousHtmlHeight
      body.style.height = previousBodyHeight
    }
  }, [])

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

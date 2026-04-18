'use client'

import { PresenterScreen, usePresenter } from '@party/charades'
import { useEffect, useState, type CSSProperties } from 'react'
import styles from './page.module.css'

export function PresentRouteScreen({ roomId }: { roomId: string }) {
  const [viewportStyle, setViewportStyle] = useState({
    '--presenter-viewport-height': '100dvh',
    '--presenter-viewport-width': '100vw',
    '--presenter-viewport-top': '0px',
    '--presenter-viewport-left': '0px',
  } as CSSProperties)

  useEffect(() => {
    let frameId = 0

    const applyViewportFrame = () => {
      const visualViewport = window.visualViewport
      const nextHeight = visualViewport?.height ?? window.innerHeight
      const nextWidth = visualViewport?.width ?? window.innerWidth
      const nextTop = visualViewport?.offsetTop ?? 0
      const nextLeft = visualViewport?.offsetLeft ?? 0

      window.scrollTo(0, 0)

      setViewportStyle({
        '--presenter-viewport-height': `${Math.round(nextHeight)}px`,
        '--presenter-viewport-width': `${Math.round(nextWidth)}px`,
        '--presenter-viewport-top': `${Math.round(nextTop)}px`,
        '--presenter-viewport-left': `${Math.round(nextLeft)}px`,
      } as CSSProperties)
    }

    const scheduleViewportFrame = () => {
      cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        applyViewportFrame()
      })
    }

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

    scheduleViewportFrame()

    window.addEventListener('resize', scheduleViewportFrame)
    window.addEventListener('orientationchange', scheduleViewportFrame)
    window.visualViewport?.addEventListener('resize', scheduleViewportFrame)
    window.visualViewport?.addEventListener('scroll', scheduleViewportFrame)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', scheduleViewportFrame)
      window.removeEventListener('orientationchange', scheduleViewportFrame)
      window.visualViewport?.removeEventListener('resize', scheduleViewportFrame)
      window.visualViewport?.removeEventListener('scroll', scheduleViewportFrame)
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      html.style.overscrollBehavior = previousHtmlOverscroll
      body.style.overscrollBehavior = previousBodyOverscroll
      html.style.height = previousHtmlHeight
      body.style.height = previousBodyHeight
    }
  }, [])

  return (
    <div className={styles.routeShell} style={viewportStyle}>
      <PresentRoute roomId={roomId} />
    </div>
  )
}

function PresentRoute({ roomId }: { roomId: string }) {
  if (!roomId) {
    return <RouteStatus eyebrow="Brak pokoju" message="Zeskanuj QR ponownie, aby otworzy\u0107 ekran prezentera." />
  }

  return <PresenterRouteContent roomId={roomId} />
}

function PresenterRouteContent({ roomId }: { roomId: string }) {
  const { state, connectionState, hasSyncedState, revealWord, changeWord } = usePresenter(roomId)

  if (!hasSyncedState && connectionState !== 'connected') {
    return (
      <RouteStatus
        eyebrow={connectionState === 'error' ? 'Problem z po\u0142\u0105czeniem' : 'Prezenter'}
        message={
          connectionState === 'error'
            ? 'Nie uda\u0142o si\u0119 po\u0142\u0105czy\u0107 z pokojem. Od\u015bwie\u017c ekran prezentera albo zeskanuj QR ponownie.'
            : '\u0141\u0105czenie z pokojem gry...'
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

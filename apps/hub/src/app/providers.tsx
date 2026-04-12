'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ClerkInstance = {
  load: (opts?: object) => Promise<void>
  openSignIn: (opts: object) => void
  redirectToSignIn: () => void
  mountSignIn?: (node: HTMLElement) => void
  unmountSignIn?: (node: HTMLElement) => void
  signOut: (cb: () => void) => void
  user: {
    username: string | null
    firstName: string | null
    createdAt: Date | null
    emailAddresses: { emailAddress: string }[]
  } | null | undefined
}

type ClerkCtx = {
  clerk: ClerkInstance | null
  isLoaded: boolean
  isSignedIn: boolean
}

const ClerkContext = createContext<ClerkCtx>({ clerk: null, isLoaded: false, isSignedIn: false })

export function useClerk() {
  return useContext(ClerkContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [clerk, setClerk] = useState<ClerkInstance | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    // clerk.browser.js is loaded via <Script> in layout.tsx before this runs
    // It auto-initializes window.Clerk when data-clerk-publishable-key is present
    function init() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = (window as any).Clerk as ClerkInstance | undefined
      if (!instance) {
        setTimeout(init, 50)
        return
      }
      // Clerk auto-loads itself — just wait for it to be ready
      instance.load({ standardBrowser: true } as object).then(() => {
        setClerk(instance)
        setIsLoaded(true)
        setIsSignedIn(!!instance.user)
      }).catch(() => {
        // Already loaded — still set state
        setClerk(instance)
        setIsLoaded(true)
        setIsSignedIn(!!instance.user)
      })
    }
    init()
  }, [])

  return (
    <ClerkContext.Provider value={{ clerk, isLoaded, isSignedIn }}>
      {children}
    </ClerkContext.Provider>
  )
}

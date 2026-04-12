'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  refresh: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refresh: async () => null,
  logout: async () => {},
})

async function readCurrentUser() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Nie udało się pobrać sesji.')
  }

  const payload = (await response.json()) as { user: AuthUser }
  return payload.user
}

export function useAuth() {
  return useContext(AuthContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refresh() {
    setIsLoading(true)

    try {
      const nextUser = await readCurrentUser()
      setUser(nextUser)
      return nextUser
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

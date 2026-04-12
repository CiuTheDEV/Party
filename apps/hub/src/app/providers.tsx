'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  entitlements: string[]
  isAdmin: boolean
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  refresh: () => Promise<AuthUser | null>
  logout: () => Promise<void>
  redeemActivationCode: (code: string) => Promise<AuthUser | null>
  createActivationCode: (code: string) => Promise<string>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refresh: async () => null,
  logout: async () => {},
  redeemActivationCode: async () => null,
  createActivationCode: async () => '',
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

  const payload = (await response.json()) as { user: Partial<AuthUser> }
  return {
    id: payload.user.id ?? '',
    email: payload.user.email ?? '',
    displayName: payload.user.displayName ?? '',
    createdAt: payload.user.createdAt ?? new Date().toISOString(),
    updatedAt: payload.user.updatedAt ?? new Date().toISOString(),
    lastLoginAt: payload.user.lastLoginAt ?? null,
    entitlements: payload.user.entitlements ?? [],
    isAdmin: payload.user.isAdmin ?? false,
  }
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

  async function redeemActivationCode(code: string) {
    const response = await fetch('/api/auth/redeem-code', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Zaloguj się, aby wpisać kod aktywacyjny.')
      }

      throw new Error('Nie udało się aktywować kodu.')
    }

    const payload = (await response.json()) as { user: Partial<AuthUser> }
    const nextUser: AuthUser = {
      id: payload.user.id ?? '',
      email: payload.user.email ?? '',
      displayName: payload.user.displayName ?? '',
      createdAt: payload.user.createdAt ?? new Date().toISOString(),
      updatedAt: payload.user.updatedAt ?? new Date().toISOString(),
      lastLoginAt: payload.user.lastLoginAt ?? null,
      entitlements: payload.user.entitlements ?? [],
      isAdmin: payload.user.isAdmin ?? false,
    }

    setUser(nextUser)
    return nextUser
  }

  async function createActivationCode(code: string) {
    const response = await fetch('/api/auth/admin/create-code', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Brak uprawnień administratora.')
      }

      if (response.status === 409) {
        throw new Error('Taki kod już istnieje.')
      }

      throw new Error('Nie udało się utworzyć kodu.')
    }

    const payload = (await response.json()) as { activationCode: { code?: string } }
    return payload.activationCode.code ?? ''
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh, logout, redeemActivationCode, createActivationCode }}>
      {children}
    </AuthContext.Provider>
  )
}

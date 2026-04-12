'use client'

import { createContext, useContext, useEffect, useRef, useState, lazy, Suspense } from 'react'

const ProfileModal = lazy(() =>
  import('../features/profile/ProfileModal').then((m) => ({ default: m.ProfileModal })),
)

export type AuthUser = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  entitlements: string[]
  unlockExpiresAt: string | null
  isAdmin: boolean
  avatarId: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  refresh: () => Promise<AuthUser | null>
  logout: () => Promise<void>
  redeemActivationCode: (code: string) => Promise<AuthUser | null>
  createActivationCode: (
    code: string,
    codeValidityMinutes: number,
    unlockDurationMinutes: number,
  ) => Promise<string>
  updateAvatar: (avatarId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refresh: async () => null,
  logout: async () => {},
  redeemActivationCode: async () => null,
  createActivationCode: async () => '',
  updateAvatar: async () => {},
})

export type ProfileModalContextValue = {
  isOpen: boolean
  openProfile: () => void
  closeProfile: () => void
}

export const ProfileModalContext = createContext<ProfileModalContextValue>({
  isOpen: false,
  openProfile: () => {},
  closeProfile: () => {},
})

function mapAuthUser(payload: Partial<AuthUser>): AuthUser {
  return {
    id: payload.id ?? '',
    email: payload.email ?? '',
    displayName: payload.displayName ?? '',
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: payload.updatedAt ?? new Date().toISOString(),
    lastLoginAt: payload.lastLoginAt ?? null,
    entitlements: payload.entitlements ?? [],
    unlockExpiresAt: payload.unlockExpiresAt ?? null,
    isAdmin: payload.isAdmin ?? false,
    avatarId: payload.avatarId ?? 'smile',
  }
}

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
  return mapAuthUser(payload.user)
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useProfileModal() {
  return useContext(ProfileModalContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const refreshRef = useRef<() => Promise<AuthUser | null>>(async () => null)

  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

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
    const nextUser = mapAuthUser(payload.user)
    setUser(nextUser)
    return nextUser
  }

  async function createActivationCode(code: string, codeValidityMinutes: number, unlockDurationMinutes: number) {
    const response = await fetch('/api/auth/admin/create-code', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, codeValidityMinutes, unlockDurationMinutes }),
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

  async function updateAvatar(avatarId: string) {
    // Optimistic update — show new avatar instantly before server confirms
    setUser((prev) => (prev ? { ...prev, avatarId } : prev))

    const response = await fetch('/api/auth/update-avatar', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarId }),
    })

    if (!response.ok) {
      throw new Error('Nie udało się zaktualizować awatara.')
    }

    const payload = (await response.json()) as { user: Partial<AuthUser> }
    setUser(mapAuthUser(payload.user))
  }

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    if (!user?.unlockExpiresAt) {
      return undefined
    }

    const unlockAt = new Date(user.unlockExpiresAt).getTime()
    const delay = Math.max(0, unlockAt - Date.now() + 250)
    const timeoutId = window.setTimeout(() => {
      void refreshRef.current()
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [user?.unlockExpiresAt])

  const profileModalValue: ProfileModalContextValue = {
    isOpen: isProfileOpen,
    openProfile: () => setIsProfileOpen(true),
    closeProfile: () => setIsProfileOpen(false),
  }

  return (
    <ProfileModalContext.Provider value={profileModalValue}>
      <AuthContext.Provider value={{ user, isLoading, refresh, logout, redeemActivationCode, createActivationCode, updateAvatar }}>
        {children}
        {isProfileOpen && (
          <Suspense fallback={null}>
            <ProfileModal />
          </Suspense>
        )}
      </AuthContext.Provider>
    </ProfileModalContext.Provider>
  )
}

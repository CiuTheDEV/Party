const PLAY_PREFERENCES_STORAGE_KEY = 'charades:play-preferences'

export type CharadesPlayPreferences = {
  soundEnabled: boolean
  animationsEnabled: boolean
}

const DEFAULT_PREFERENCES: CharadesPlayPreferences = {
  soundEnabled: true,
  animationsEnabled: true,
}

export function readCharadesPlayPreferences(): CharadesPlayPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES
  }

  const raw = window.localStorage.getItem(PLAY_PREFERENCES_STORAGE_KEY)
  if (!raw) {
    return DEFAULT_PREFERENCES
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CharadesPlayPreferences>
    return {
      soundEnabled: parsed.soundEnabled ?? true,
      animationsEnabled: parsed.animationsEnabled ?? true,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function writeCharadesPlayPreferences(preferences: CharadesPlayPreferences) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PLAY_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}

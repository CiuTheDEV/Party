'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createDefaultBindings, hasBindingChanges, loadPersistedBindings, persistBindings } from './codenames-controls-bindings'
import { publishSettingsDirtyState } from './codenames-settings-overlay-helpers'

type Options = {
  onUnsavedChangesChange?: (value: boolean) => void
}

const defaultBindingsSnapshot = createDefaultBindings()

export function useSettingsBindingsDraft({ onUnsavedChangesChange }: Options) {
  const [bindings, setBindings] = useState<Record<string, string>>(() => createDefaultBindings())
  const [savedBindings, setSavedBindings] = useState<Record<string, string>>(() => createDefaultBindings())
  const onUnsavedChangesChangeRef = useRef(onUnsavedChangesChange)

  const hasUnsavedChanges = useMemo(() => hasBindingChanges(savedBindings, bindings), [bindings, savedBindings])
  const hasDefaultChanges = useMemo(() => hasBindingChanges(defaultBindingsSnapshot, bindings), [bindings])

  useEffect(() => {
    onUnsavedChangesChangeRef.current = onUnsavedChangesChange
  }, [onUnsavedChangesChange])

  useEffect(() => {
    const initialBindings = loadPersistedBindings()
    setSavedBindings(initialBindings)
    setBindings(initialBindings)
    publishSettingsDirtyState(false, onUnsavedChangesChangeRef.current)
  }, [])

  useEffect(() => {
    return () => {
      publishSettingsDirtyState(false, onUnsavedChangesChangeRef.current)
    }
  }, [])

  function updateBindings(nextBindings: Record<string, string>) {
    setBindings(nextBindings)
    publishSettingsDirtyState(hasBindingChanges(savedBindings, nextBindings), onUnsavedChangesChangeRef.current)
  }

  function saveBindings() {
    persistBindings(bindings)
    setSavedBindings(bindings)
    publishSettingsDirtyState(false, onUnsavedChangesChangeRef.current)
  }

  function resetToSavedBindings() {
    updateBindings(savedBindings)
  }

  function resetToDefaultBindings() {
    const defaults = createDefaultBindings()
    updateBindings(defaults)
  }

  return {
    bindings,
    savedBindings,
    hasUnsavedChanges,
    hasDefaultChanges,
    updateBindings,
    saveBindings,
    resetToSavedBindings,
    resetToDefaultBindings,
  }
}

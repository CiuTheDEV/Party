import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CharadesWordCategory } from '../../setup/helpers'
import type { CharadesSelectedCategories } from '../../setup/state'
import {
  buildPromptPool,
  createPromptPoolState,
  selectPromptCandidate,
  selectPromptRerollCandidate,
  type TurnPrompt,
} from './word-pool-helpers'
import {
  appendRejectedPrompt,
  appendUsedPrompt,
  normalizeWordHistory,
} from './word-history-helpers'
import {
  ensureCharadesWordHistorySession,
  readCharadesWordHistory,
  startNewCharadesWordHistorySession,
  writeCharadesWordHistory,
} from '../shared/charades-storage'

export function useWordPool(categories: CharadesWordCategory[], selected: CharadesSelectedCategories) {
  const prompts = useMemo(() => createPromptPoolState(categories, selected), [categories, selected])
  const [historyVersion, setHistoryVersion] = useState(0)
  const historyRef = useRef(normalizeWordHistory(readCharadesWordHistory(), ensureCharadesWordHistorySession().sessionId))
  const poolKey = getPoolKey(categories, selected)

  useEffect(() => {
    historyRef.current = normalizeWordHistory(readCharadesWordHistory(), ensureCharadesWordHistorySession().sessionId)
    setHistoryVersion((current) => current + 1)
  }, [poolKey])

  const persistHistory = useCallback((nextHistory: ReturnType<typeof normalizeWordHistory>) => {
    historyRef.current = nextHistory
    writeCharadesWordHistory(nextHistory)
    setHistoryVersion((current) => current + 1)
  }, [])

  const selectInitialCandidate = useCallback((playerKey: string): TurnPrompt => {
    const prompt = selectPromptCandidate({
      prompts,
      playerKey,
      history: historyRef.current,
    })

    if (!prompt) {
      throw new Error('Charades word pool is empty.')
    }

    return prompt
  }, [prompts])

  const rerollWordOnly = useCallback((params: {
    playerKey: string
    currentPrompt: TurnPrompt
    rejectedPromptKeysThisTurn: string[]
  }) => {
    const nextPrompt = selectPromptRerollCandidate({
      prompts,
      playerKey: params.playerKey,
      history: historyRef.current,
      currentPrompt: params.currentPrompt,
      rejectedPromptKeysThisTurn: params.rejectedPromptKeysThisTurn,
      scope: 'word-only',
    })

    if (!nextPrompt) {
      return null
    }

    return nextPrompt
  }, [prompts])

  const rerollWordAndCategory = useCallback((params: {
    playerKey: string
    currentPrompt: TurnPrompt
    rejectedPromptKeysThisTurn: string[]
  }) => {
    const nextPrompt = selectPromptRerollCandidate({
      prompts,
      playerKey: params.playerKey,
      history: historyRef.current,
      currentPrompt: params.currentPrompt,
      rejectedPromptKeysThisTurn: params.rejectedPromptKeysThisTurn,
      scope: 'word-and-category',
    })

    if (!nextPrompt) {
      return null
    }

    return nextPrompt
  }, [prompts])

  const recordRejectedPrompt = useCallback((playerKey: string, prompt: TurnPrompt) => {
    persistHistory(appendRejectedPrompt(historyRef.current, playerKey, prompt))
  }, [persistHistory])

  const commitPrompt = useCallback((prompt: TurnPrompt) => {
    persistHistory(appendUsedPrompt(historyRef.current, prompt))
  }, [persistHistory])

  const reset = useCallback(() => {
    const nextHistory = startNewCharadesWordHistorySession()
    historyRef.current = nextHistory
    setHistoryVersion((current) => current + 1)
  }, [])

  return {
    prompts: historyVersion >= 0 ? prompts : buildPromptPool(categories, selected),
    selectInitialCandidate,
    rerollWordOnly,
    rerollWordAndCategory,
    recordRejectedPrompt,
    commitPrompt,
    reset,
    getHistory: () => historyRef.current,
  }
}

function getPoolKey(categories: CharadesWordCategory[], selected: CharadesSelectedCategories) {
  const categoryKey = categories.map((category) => category.id).join('|')
  const selectedKey = Object.entries(selected)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([categoryId, difficulties]) => `${categoryId}:${[...difficulties].sort().join(',')}`)
    .join('|')

  return `${categoryKey}::${selectedKey}`
}

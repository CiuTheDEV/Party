import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Phase, PlayerSummary } from './playboard-types'

type Params = {
  phase: Phase
  players: PlayerSummary[]
  order: number[]
  currentOrderIdx: number
  isCorrectVerdictBlocked: boolean
  onGiveVerdict: (correct: boolean, guessedPlayerIdx?: number) => void
}

export function useHostVerdictFlow({
  phase,
  players,
  order,
  currentOrderIdx,
  isCorrectVerdictBlocked,
  onGiveVerdict,
}: Params) {
  const [isVerdictPickerOpen, setIsVerdictPickerOpen] = useState(false)
  const [verdictFocusTarget, setVerdictFocusTarget] = useState<'correct' | 'incorrect'>('correct')
  const [roundSummaryFocusTarget, setRoundSummaryFocusTarget] = useState<'menu' | 'continue'>('continue')
  const [verdictPickerStage, setVerdictPickerStage] = useState<'players' | 'actions'>('players')
  const [verdictPickerActionTarget, setVerdictPickerActionTarget] = useState<'cancel' | 'confirm'>('confirm')
  const [isIncorrectVerdictConfirmOpen, setIsIncorrectVerdictConfirmOpen] = useState(false)
  const [incorrectVerdictConfirmFocusTarget, setIncorrectVerdictConfirmFocusTarget] = useState<'stay' | 'confirm'>(
    'stay',
  )
  const [selectedGuessedPlayerIdx, setSelectedGuessedPlayerIdx] = useState<number | null>(null)

  const presenterIdx = order[currentOrderIdx]
  const guessedPlayers = useMemo(
    () =>
      players
        .map((player, index) => ({ ...player, index }))
        .filter((player) => player.index !== presenterIdx),
    [players, presenterIdx],
  )
  const guessedPlayerIndexes = useMemo(() => guessedPlayers.map((player) => player.index), [guessedPlayers])

  useEffect(() => {
    if (phase !== 'verdict') {
      setIsVerdictPickerOpen(false)
      setSelectedGuessedPlayerIdx(null)
      setVerdictFocusTarget('correct')
      setVerdictPickerStage('players')
      setVerdictPickerActionTarget('confirm')
      setIncorrectVerdictConfirmFocusTarget('stay')
      setIsIncorrectVerdictConfirmOpen(false)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'verdict' && isCorrectVerdictBlocked) {
      setVerdictFocusTarget('incorrect')
      setIsVerdictPickerOpen(false)
      setVerdictPickerStage('players')
      setVerdictPickerActionTarget('confirm')
    }
  }, [isCorrectVerdictBlocked, phase])

  useEffect(() => {
    if (phase !== 'round-summary') {
      setRoundSummaryFocusTarget('continue')
    }
  }, [phase])

  useEffect(() => {
    if (!isVerdictPickerOpen || selectedGuessedPlayerIdx !== null) {
      return
    }

    setSelectedGuessedPlayerIdx(guessedPlayerIndexes[0] ?? null)
  }, [guessedPlayerIndexes, isVerdictPickerOpen, selectedGuessedPlayerIdx])

  const openIncorrectVerdictConfirm = useCallback(() => {
    setIncorrectVerdictConfirmFocusTarget('stay')
    setIsIncorrectVerdictConfirmOpen(true)
  }, [])

  const closeIncorrectVerdictConfirm = useCallback(() => {
    setIncorrectVerdictConfirmFocusTarget('stay')
    setIsIncorrectVerdictConfirmOpen(false)
  }, [])

  const openVerdictPicker = useCallback(() => {
    setSelectedGuessedPlayerIdx((current) => current ?? guessedPlayerIndexes[0] ?? null)
    setVerdictPickerStage('players')
    setVerdictPickerActionTarget('confirm')
    setIsVerdictPickerOpen(true)
  }, [guessedPlayerIndexes])

  const closeVerdictPicker = useCallback(() => {
    setVerdictPickerStage('players')
    setVerdictPickerActionTarget('confirm')
    setIsVerdictPickerOpen(false)
  }, [])

  const selectVerdictPlayer = useCallback((playerIdx: number) => {
    setSelectedGuessedPlayerIdx(playerIdx)
    setVerdictPickerStage('actions')
    setVerdictPickerActionTarget('confirm')
  }, [])

  const confirmVerdictPlayer = useCallback(() => {
    if (selectedGuessedPlayerIdx === null) {
      return
    }

    onGiveVerdict(true, selectedGuessedPlayerIdx)
  }, [onGiveVerdict, selectedGuessedPlayerIdx])

  const handleIncorrectVerdict = useCallback(() => {
    if (isCorrectVerdictBlocked) {
      onGiveVerdict(false)
      return
    }

    openIncorrectVerdictConfirm()
  }, [isCorrectVerdictBlocked, onGiveVerdict, openIncorrectVerdictConfirm])

  return {
    closeIncorrectVerdictConfirm,
    closeVerdictPicker,
    confirmVerdictPlayer,
    guessedPlayerIndexes,
    guessedPlayers,
    handleIncorrectVerdict,
    incorrectVerdictConfirmFocusTarget,
    isIncorrectVerdictConfirmOpen,
    isVerdictPickerOpen,
    openIncorrectVerdictConfirm,
    openVerdictPicker,
    roundSummaryFocusTarget,
    selectedGuessedPlayerIdx,
    selectVerdictPlayer,
    setSelectedGuessedPlayerIdx,
    setIncorrectVerdictConfirmFocusTarget,
    setRoundSummaryFocusTarget,
    setVerdictFocusTarget,
    setVerdictPickerActionTarget,
    setVerdictPickerStage,
    verdictFocusTarget,
    verdictPickerActionTarget,
    verdictPickerStage,
  }
}

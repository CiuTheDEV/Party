import { useCallback, useEffect, useState } from 'react'

type Params = {
  shouldRun: boolean
  isPaused?: boolean
  onFinished: () => void
}

export function useRoundOrderCountdown({ shouldRun, isPaused = false, onFinished }: Params) {
  const [roundOrderCountdown, setRoundOrderCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!shouldRun) {
      setRoundOrderCountdown(null)
    }
  }, [shouldRun])

  useEffect(() => {
    if (roundOrderCountdown === null || isPaused) {
      return
    }

    if (roundOrderCountdown <= 0) {
      onFinished()
      setRoundOrderCountdown(null)
      return
    }

    const timer = window.setTimeout(() => {
      setRoundOrderCountdown((current) => (current === null ? null : current - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [isPaused, roundOrderCountdown, onFinished])

  const startRoundOrderCountdown = useCallback(() => {
    setRoundOrderCountdown((current) => (current === null ? 3 : current))
  }, [])

  return {
    roundOrderCountdown,
    startRoundOrderCountdown,
  }
}

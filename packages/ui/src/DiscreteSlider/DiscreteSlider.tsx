'use client'

import { useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import styles from './DiscreteSlider.module.css'

type DiscreteSliderProps = {
  options: readonly number[]
  value: number
  onChange: (value: number) => void
  formatValue: (value: number) => string
  disabled?: boolean
}

function getSliderProgress(value: number, options: readonly number[]) {
  if (options.length <= 1) {
    return '0%'
  }

  const index = options.indexOf(value)
  const safeIndex = index >= 0 ? index : 0

  return `${(safeIndex / (options.length - 1)) * 100}%`
}

export function DiscreteSlider({ options, value, onChange, formatValue, disabled = false }: DiscreteSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const progress = getSliderProgress(value, options)

  const selectNearestOption = useCallback(
    (clientX: number) => {
      if (disabled || !trackRef.current || options.length === 0) {
        return
      }

      const rect = trackRef.current.getBoundingClientRect()
      if (rect.width <= 0) {
        return
      }

      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const rawIndex = ratio * (options.length - 1)
      const nearestIndex = Math.round(rawIndex)
      onChange(options[nearestIndex] ?? options[0] ?? value)
    },
    [disabled, onChange, options, value],
  )

  const beginPointerDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      event.preventDefault()
      selectNearestOption(event.clientX)

      const handlePointerMove = (moveEvent: PointerEvent) => {
        selectNearestOption(moveEvent.clientX)
      }

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [disabled, selectNearestOption],
  )

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      const currentIndex = Math.max(0, options.indexOf(value))

      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault()
        onChange(options[Math.max(0, currentIndex - 1)] ?? options[0] ?? value)
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault()
        onChange(options[Math.min(options.length - 1, currentIndex + 1)] ?? options[options.length - 1] ?? value)
      }

      if (event.key === 'Home') {
        event.preventDefault()
        onChange(options[0] ?? value)
      }

      if (event.key === 'End') {
        event.preventDefault()
        onChange(options[options.length - 1] ?? value)
      }
    },
    [disabled, onChange, options, value],
  )

  return (
    <div className={`${styles.root} ${disabled ? styles.disabled : ''}`}>
      <div
        ref={trackRef}
        className={styles.trackWrap}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-valuemin={options[0]}
        aria-valuemax={options[options.length - 1]}
        aria-valuenow={value}
        aria-valuetext={formatValue(value)}
        onPointerDown={beginPointerDrag}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.track}>
          <div className={styles.trackFill} style={{ width: progress }} />
          <div className={styles.thumb} style={{ left: progress }} />
        </div>
      </div>
      <div className={styles.scale}>
        {options.map((option, index) => {
          const position = options.length <= 1 ? '0%' : `${(index / (options.length - 1)) * 100}%`

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              className={`${styles.scaleOption} ${value === option ? styles.scaleOptionActive : ''}`}
              onClick={() => onChange(option)}
              style={{ ['--slider-position' as string]: position }}
            >
              <span className={styles.scaleTick} aria-hidden="true" />
              <span className={styles.scaleValue}>{formatValue(option)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

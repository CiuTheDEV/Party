'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import styles from './AutoscaledWord.module.css'

type AutoscaledWordProps = {
  text: string
  className?: string
  textClassName?: string
  isVisible?: boolean
  minFontSize?: number
  maxFontSize: number
  step?: number
}

export function AutoscaledWord({
  text,
  className,
  textClassName,
  isVisible,
  minFontSize = 14,
  maxFontSize,
  step = 2,
}: AutoscaledWordProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)
  const [fontSize, setFontSize] = useState(maxFontSize)

  useLayoutEffect(() => {
    const container = containerRef.current
    const textNode = textRef.current

    if (!container || !textNode) {
      return
    }

    const measure = () => {
      let nextFontSize = maxFontSize

      textNode.style.fontSize = `${nextFontSize}px`

      while (
        nextFontSize > minFontSize &&
        (textNode.scrollHeight > container.clientHeight + 1 ||
          textNode.scrollWidth > container.clientWidth + 1)
      ) {
        nextFontSize = Math.max(minFontSize, nextFontSize - step)
        textNode.style.fontSize = `${nextFontSize}px`
      }

      setFontSize(nextFontSize)
    }

    measure()

    const resizeObserver = new ResizeObserver(() => {
      measure()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [maxFontSize, minFontSize, step, text])

  return (
    <div
      ref={containerRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-visible={typeof isVisible === 'boolean' ? String(isVisible) : undefined}
    >
      <div
        ref={textRef}
        className={`${styles.text}${textClassName ? ` ${textClassName}` : ''}`}
        data-visible={typeof isVisible === 'boolean' ? String(isVisible) : undefined}
        style={{ fontSize }}
      >
        {text}
      </div>
    </div>
  )
}

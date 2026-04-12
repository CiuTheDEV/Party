'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { resolveAutoscaledWordLayout } from './autoscaled-word-layout'
import styles from './AutoscaledWord.module.css'

type AutoscaledWordProps = {
  text: string
  className?: string
  textClassName?: string
  isVisible?: boolean
  wrapMode?: 'balance' | 'nowrap'
  minFontSize?: number
  maxFontSize: number
  step?: number
  layoutStrategy?: 'css-wrap' | 'whole-word'
  averageGlyphWidth?: number
  horizontalPadding?: number
  verticalPadding?: number
  lineHeight?: number
}

export function AutoscaledWord({
  text,
  className,
  textClassName,
  isVisible,
  wrapMode = 'balance',
  minFontSize = 14,
  maxFontSize,
  step = 2,
  layoutStrategy = 'css-wrap',
  averageGlyphWidth = 0.56,
  horizontalPadding = 0,
  verticalPadding = 0,
  lineHeight = 1.04,
}: AutoscaledWordProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)
  const [layoutState, setLayoutState] = useState(() => ({
    fontSize: maxFontSize,
    lines: [text],
  }))

  useLayoutEffect(() => {
    const container = containerRef.current
    const textNode = textRef.current

    if (!container || !textNode) {
      return
    }

    const measure = () => {
      if (layoutStrategy === 'whole-word') {
        const resolved = resolveAutoscaledWordLayout({
          text,
          strategy: 'whole-word',
          width: container.clientWidth,
          height: container.clientHeight,
          maxFontSize,
          minFontSize,
          lineHeight,
          horizontalPadding,
          verticalPadding,
          averageGlyphWidth,
        })

        setLayoutState(resolved)
        return
      }

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

      setLayoutState({
        fontSize: nextFontSize,
        lines: [text],
      })
    }

    measure()

    const resizeObserver = new ResizeObserver(() => {
      measure()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [
    averageGlyphWidth,
    horizontalPadding,
    layoutStrategy,
    lineHeight,
    maxFontSize,
    minFontSize,
    step,
    text,
    verticalPadding,
  ])

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
      data-wrap-mode={wrapMode}
      data-layout-strategy={layoutStrategy}
      style={{ fontSize: layoutState.fontSize }}
    >
      {layoutStrategy === 'whole-word'
        ? layoutState.lines.map((line, index) => (
            <span key={`${line}-${index}`} className={styles.line}>
              {line}
            </span>
          ))
        : text}
      </div>
    </div>
  )
}

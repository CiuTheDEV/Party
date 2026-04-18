'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import type { Card } from './codenames-events'

gsap.registerPlugin(useGSAP)

type RoundBoardRevealAnimationParams = {
  scopeRef: RefObject<HTMLElement | null>
  cards: Card[]
  boardKey: string
  startingTeam: 'red' | 'blue' | null
  enabled?: boolean
}

type OrderedCardEntry = {
  inner: HTMLElement
  node: HTMLElement
  index: number
}

export function useRoundBoardRevealAnimation({
  scopeRef,
  cards,
  boardKey,
  startingTeam,
  enabled = true,
}: RoundBoardRevealAnimationParams) {
  const previousRevealSignatureRef = useRef('')

  useGSAP(
    () => {
      if (!enabled) {
        return
      }

      const root = scopeRef.current
      if (!root) {
        return
      }

      const board = root.querySelector<HTMLElement>('[data-round-board]')
      const cardNodes = gsap.utils.toArray<HTMLElement>('[data-round-card]', root)
      const cardInnerNodes = gsap.utils.toArray<HTMLElement>('[data-round-card-inner]', root)
      const sheen = root.querySelector<HTMLElement>('[data-round-sheen]')

      if (!board || cardNodes.length === 0 || cardInnerNodes.length !== cardNodes.length) {
        return
      }

      const orderedEntries = cardNodes
        .map<OrderedCardEntry>((node, index) => ({
          node,
          inner: cardInnerNodes[index],
          index: Number(node.dataset.roundIndex ?? index),
        }))
        .sort((left, right) => {
          const leftRow = Math.floor(left.index / 5)
          const rightRow = Math.floor(right.index / 5)

          if (leftRow !== rightRow) {
            return leftRow - rightRow
          }

          return left.index - right.index
        })

      const orderedCardNodes = orderedEntries.map((entry) => entry.node)
      const orderedCardInnerNodes = orderedEntries.map((entry) => entry.inner)

      gsap.set(board, {
        autoAlpha: 0,
        y: 8,
      })

      gsap.set(orderedCardInnerNodes, {
        rotationY: 180,
        transformPerspective: 1200,
        transformOrigin: '50% 50%',
      })

      if (sheen) {
        gsap.set(sheen, {
          autoAlpha: 0,
          xPercent: -10,
        })
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power2.out',
        },
        delay: 0.1,
      })

      timeline.to(
        board,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.2,
          clearProps: 'transform,opacity,visibility',
        },
        0,
      )

      timeline.to(
        orderedCardInnerNodes,
        {
          rotationY: 0,
          duration: 0.46,
          ease: 'power2.inOut',
          stagger: {
            each: 0.05,
            from: 'start',
          },
          clearProps: 'transform',
        },
        0.08,
      )

      if (sheen) {
        timeline.fromTo(
          sheen,
          { autoAlpha: 0 },
          {
            autoAlpha: 0.18,
            xPercent: 16,
            duration: 0.34,
            ease: 'power1.out',
            clearProps: 'transform,opacity,visibility',
          },
          0.16,
        )
        timeline.to(
          sheen,
          {
            autoAlpha: 0,
            xPercent: 28,
            duration: 0.2,
            ease: 'power1.in',
            clearProps: 'transform,opacity,visibility',
          },
          0.42,
        )
      }

      if (startingTeam) {
        const accentNodes = orderedCardNodes.filter((node) => node.dataset.color === startingTeam)

        if (accentNodes.length > 0) {
          timeline.fromTo(
            accentNodes,
            { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
            {
              boxShadow:
                startingTeam === 'red'
                  ? '0 0 0 1px rgba(255, 90, 79, 0.42), 0 0 0 7px rgba(255, 90, 79, 0.08)'
                  : '0 0 0 1px rgba(74, 167, 255, 0.42), 0 0 0 7px rgba(74, 167, 255, 0.08)',
              duration: 0.18,
              stagger: {
                each: 0.018,
                from: 'start',
              },
              yoyo: true,
              repeat: 1,
              ease: 'power1.inOut',
              clearProps: 'boxShadow',
            },
            0.52,
          )
        }
      }

      return () => {
        timeline.kill()
      }
    },
    {
      scope: scopeRef,
      dependencies: [enabled, boardKey, startingTeam],
      revertOnUpdate: true,
    },
  )

  useEffect(() => {
    if (!enabled) {
      previousRevealSignatureRef.current = ''
      return
    }

    const root = scopeRef.current
    if (!root) {
      return
    }

    const revealSignature = cards.map((card) => (card.revealed ? '1' : '0')).join('')
    const previousRevealSignature = previousRevealSignatureRef.current
    previousRevealSignatureRef.current = revealSignature

    if (!previousRevealSignature) {
      return
    }

    const cardNodes = gsap.utils.toArray<HTMLElement>('[data-round-card]', root)
    const newlyRevealedCards = cards
      .map((card, index) => (card.revealed && previousRevealSignature[index] !== '1' ? index : -1))
      .filter((index) => index !== -1)

    newlyRevealedCards.forEach((index, order) => {
      const node = cardNodes[index]
      if (!node) {
        return
      }

      gsap.killTweensOf(node)

      const accentColor =
        node.dataset.color === 'red'
          ? 'rgba(255, 90, 79, 0.45)'
          : node.dataset.color === 'blue'
            ? 'rgba(74, 167, 255, 0.45)'
            : node.dataset.color === 'assassin'
              ? 'rgba(255, 255, 255, 0.22)'
              : 'rgba(255, 255, 255, 0.16)'

      gsap.fromTo(
        node,
        {
          scale: 1,
          y: 0,
          filter: 'brightness(1)',
          boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
        },
        {
          scale: 1.03,
          y: -2,
          filter: 'brightness(1.1)',
          boxShadow: `0 0 0 2px ${accentColor}, 0 12px 30px rgba(0, 0, 0, 0.26)`,
          duration: 0.14,
          repeat: 1,
          yoyo: true,
          ease: 'power1.inOut',
          clearProps: 'transform,filter,boxShadow',
        },
      )
    })
  }, [cards, enabled, scopeRef])
}

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
      const sheen = root.querySelector<HTMLElement>('[data-round-sheen]')

      if (!board || cardNodes.length === 0) {
        return
      }

      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          noReduceMotion: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const reduceMotion = context.conditions?.reduceMotion ?? false

          if (reduceMotion) {
            gsap.set(board, { autoAlpha: 1, clearProps: 'all' })
            gsap.set(cardNodes, { autoAlpha: 1, clearProps: 'all' })
            if (sheen) {
              gsap.set(sheen, { autoAlpha: 0, clearProps: 'all' })
            }
            return
          }

          gsap.set(board, {
            autoAlpha: 0,
            y: 34,
            scale: 0.945,
            rotationX: 14,
            transformPerspective: 1200,
            filter: 'blur(14px) saturate(0.82)',
          })

          gsap.set(cardNodes, {
            autoAlpha: 0,
            y: 54,
            scale: 0.78,
            rotationX: 64,
            transformPerspective: 1200,
            filter: 'blur(12px) saturate(0.85)',
          })

          if (sheen) {
            gsap.set(sheen, {
              autoAlpha: 0,
              xPercent: -140,
              rotation: -10,
            })
          }

          const timeline = gsap.timeline({
            defaults: {
              ease: 'power3.out',
            },
            delay: 0.08,
          })

          timeline.to(board, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            filter: 'blur(0px) saturate(1)',
            duration: 0.42,
            clearProps: 'transform,filter,opacity,visibility',
          })

          if (sheen) {
            timeline.fromTo(
              sheen,
              {
                autoAlpha: 0,
              },
              {
                autoAlpha: 0.96,
                xPercent: 150,
                rotation: -10,
                duration: 1.02,
                ease: 'power4.inOut',
                clearProps: 'transform,opacity,visibility',
              },
              0,
            )
          }

          timeline.to(
            cardNodes,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotationX: 0,
              filter: 'blur(0px) saturate(1)',
              duration: 0.58,
              stagger: {
                amount: 0.92,
                from: 'center',
              },
              clearProps: 'transform,filter,opacity,visibility',
            },
            0.08,
          )

          if (startingTeam) {
            const accentNodes = cardNodes.filter((node) => node.dataset.color === startingTeam)

            if (accentNodes.length > 0) {
              timeline.to(
                accentNodes,
                {
                  scale: 1.035,
                  y: -4,
                  filter: 'brightness(1.2) saturate(1.08)',
                  duration: 0.2,
                  stagger: 0.015,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power2.out',
                  clearProps: 'transform,filter',
                },
                0.42,
              )
            }
          }
        },
        root,
      )

      return () => {
        mm.revert()
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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const newlyRevealedCards = cards
      .map((card, index) => (card.revealed && previousRevealSignature[index] !== '1' ? index : -1))
      .filter((index) => index !== -1)

    newlyRevealedCards.forEach((index, order) => {
      const node = cardNodes[index]
      if (!node) {
        return
      }

      gsap.killTweensOf(node)

      if (reducedMotion) {
        gsap.set(node, { clearProps: 'transform,filter' })
        return
      }

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
          rotateZ: 0,
          filter: 'brightness(1)',
          boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
        },
        {
          scale: 1.065,
          y: -3,
          rotateZ: order % 2 === 0 ? -1.2 : 1.2,
          filter: 'brightness(1.16)',
          boxShadow: `0 0 0 2px ${accentColor}, 0 12px 30px rgba(0, 0, 0, 0.26)`,
          duration: 0.18,
          repeat: 1,
          yoyo: true,
          ease: 'power2.out',
          clearProps: 'transform,filter,boxShadow',
        },
      )
    })
  }, [cards, enabled, scopeRef])
}

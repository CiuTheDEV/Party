'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { scrollToSection } from '../scrolling'

type SectionLinkProps = {
  ariaLabel?: string
  children: ReactNode
  className?: string
  href: string
  onNavigate?: () => void
}

export function SectionLink({ ariaLabel, children, className, href, onNavigate }: SectionLinkProps) {
  if (!href.startsWith('#')) {
    return (
      <Link aria-label={ariaLabel} className={className} href={href}>
        {children}
      </Link>
    )
  }

  const handleClick = () => {
    onNavigate?.()
    scrollToSection(href)
  }

  return (
    <button aria-label={ariaLabel} className={className} type="button" onClick={handleClick}>
      {children}
    </button>
  )
}

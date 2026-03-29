'use client'

import { useEffect, useState } from 'react'

export function useActiveSection(sectionHrefs: readonly string[]) {
  const [activeHref, setActiveHref] = useState(sectionHrefs[0] ?? '#hero')

  useEffect(() => {
    const updateActiveSection = () => {
      const topbar = document.querySelector<HTMLElement>('header')
      const topbarOffset = topbar ? topbar.getBoundingClientRect().height : 0
      const currentPosition = window.scrollY + topbarOffset + 140

      const nextActiveHref =
        sectionHrefs.findLast((href) => {
          const section = document.querySelector<HTMLElement>(href)
          if (!section) return false
          return section.getBoundingClientRect().top + window.scrollY <= currentPosition
        }) ?? sectionHrefs[0] ?? '#hero'

      setActiveHref(nextActiveHref)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [sectionHrefs])

  return { activeHref, setActiveHref }
}

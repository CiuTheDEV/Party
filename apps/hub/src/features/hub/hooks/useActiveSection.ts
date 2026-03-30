'use client'

import { useEffect, useState } from 'react'

export function useActiveSection(sectionHrefs: readonly string[]) {
  const [activeHref, setActiveHref] = useState(sectionHrefs[0] ?? '#hero')

  useEffect(() => {
    const scrollContainer = document.getElementById('main-content')

    const updateActiveSection = () => {
      if (!scrollContainer) return

      const containerTop = scrollContainer.getBoundingClientRect().top
      const currentPosition = scrollContainer.scrollTop + 140

      const nextActiveHref =
        sectionHrefs.findLast((href) => {
          const section = document.querySelector<HTMLElement>(href)
          if (!section) return false
          const sectionTop =
            section.getBoundingClientRect().top - containerTop + scrollContainer.scrollTop
          return sectionTop <= currentPosition
        }) ?? sectionHrefs[0] ?? '#hero'

      setActiveHref(nextActiveHref)
    }

    updateActiveSection()
    scrollContainer?.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      scrollContainer?.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [sectionHrefs])

  return { activeHref, setActiveHref }
}

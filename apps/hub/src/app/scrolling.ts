let activeScrollAnimation = 0

export function getSectionScrollTarget(href: string) {
  const target = document.querySelector<HTMLElement>(href)
  if (!target) return null

  const topbar = document.querySelector<HTMLElement>('header')
  const topbarOffset = topbar ? topbar.getBoundingClientRect().height : 0
  const targetTop = target.getBoundingClientRect().top + window.scrollY

  return Math.max(targetTop - topbarOffset - 18, 0)
}

export function scrollToSection(href: string) {
  const scrollTop = getSectionScrollTarget(href)
  if (scrollTop === null) return

  const startTop = window.scrollY
  const distance = scrollTop - startTop
  const startTime = performance.now()
  const duration = 520

  if (activeScrollAnimation) {
    window.cancelAnimationFrame(activeScrollAnimation)
  }

  const easeInOutCubic = (progress: number) => {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
  }

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeInOutCubic(progress)

    window.scrollTo(0, startTop + distance * easedProgress)

    if (progress < 1) {
      activeScrollAnimation = window.requestAnimationFrame(step)
    }
  }

  activeScrollAnimation = window.requestAnimationFrame(step)
}

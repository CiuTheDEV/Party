let activeScrollAnimation = 0

function getHubScrollContainer() {
  return document.getElementById('main-content')
}

export function getSectionScrollTarget(href: string) {
  const target = document.querySelector<HTMLElement>(href)
  const scrollContainer = getHubScrollContainer()
  if (!target || !scrollContainer) return null

  const containerTop = scrollContainer.getBoundingClientRect().top
  const targetTop =
    target.getBoundingClientRect().top - containerTop + scrollContainer.scrollTop

  return Math.max(targetTop - 8, 0)
}

export function scrollToSection(href: string) {
  const scrollTop = getSectionScrollTarget(href)
  const scrollContainer = getHubScrollContainer()
  if (scrollTop === null || !scrollContainer) return

  const startTop = scrollContainer.scrollTop
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

    scrollContainer.scrollTo({
      top: startTop + distance * easedProgress,
    })

    if (progress < 1) {
      activeScrollAnimation = window.requestAnimationFrame(step)
    }
  }

  activeScrollAnimation = window.requestAnimationFrame(step)
}

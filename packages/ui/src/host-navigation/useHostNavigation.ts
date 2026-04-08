'use client'

import { useHostNavigationContext } from './HostNavigationProvider'

export function useHostNavigation() {
  return useHostNavigationContext()
}

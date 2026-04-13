import type { HostNavigationProfile } from '@party/game-sdk'
import { CODENAMES_NAVIGATION_COMMANDS } from './codenames-navigation-actions'
import {
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesMenuEntryTarget,
  getCodenamesRailEntryTarget,
  getNextTargetInList,
} from './codenames-navigation-targets'

type CodenamesMenuNavigationContext = {
  activeView: 'mode' | 'settings'
  railTargets: string[]
}

const DEFAULT_RAIL_TARGETS = [
  CODENAMES_NAVIGATION_TARGETS.railMenuLink,
  CODENAMES_NAVIGATION_TARGETS.railSettingsLink,
]

export const codenamesMenuNavigationProfile: HostNavigationProfile<CodenamesMenuNavigationContext> = {
  screenId: CODENAMES_NAVIGATION_SCREENS.menu,
  getEntryTarget: () => getCodenamesMenuEntryTarget(),
  resolveAction: ({ context, current, action }) => {
    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.content) {
      if (action === 'left') {
        const next = getCodenamesRailEntryTarget(context.activeView)
        return { type: 'move', zoneId: next.zoneId, targetId: next.targetId }
      }
      if (action === 'menu') return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.menuOpenSettings }
      if (action === 'confirm' || action === 'primary') return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.menuOpenSetup }
      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.rail) {
      const railTargets = context.railTargets.length > 0 ? context.railTargets : DEFAULT_RAIL_TARGETS

      if (action === 'up' || action === 'down') {
        return {
          type: 'move',
          zoneId: CODENAMES_NAVIGATION_ZONES.rail,
          targetId: getNextTargetInList(railTargets, current.targetId, action === 'up' ? -1 : 1),
        }
      }

      if (action === 'right') {
        const next = getCodenamesMenuEntryTarget()
        return { type: 'move', zoneId: next.zoneId, targetId: next.targetId }
      }

      if (action === 'confirm' || action === 'primary' || action === 'menu') {
        return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.menuSelectRailTarget }
      }
    }

    return { type: 'stay' }
  },
}

export type { CodenamesMenuNavigationContext }

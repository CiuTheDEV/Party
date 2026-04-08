import type { HostNavigationProfile } from '@party/game-sdk'
import { CHARADES_NAVIGATION_COMMANDS } from './charades-navigation-actions'
import {
  CHARADES_NAVIGATION_SCREENS,
  CHARADES_NAVIGATION_TARGETS,
  CHARADES_NAVIGATION_ZONES,
  getCharadesMenuEntryTarget,
  getCharadesRailEntryTarget,
  getNextTargetInList,
} from './charades-navigation-targets'

type CharadesMenuNavigationContext = {
  activeView: 'mode' | 'settings'
  railTargets: string[]
}

const DEFAULT_RAIL_TARGETS = [
  CHARADES_NAVIGATION_TARGETS.railMenuLink,
  CHARADES_NAVIGATION_TARGETS.railSettingsLink,
]

export const charadesMenuNavigationProfile: HostNavigationProfile<CharadesMenuNavigationContext> = {
  screenId: CHARADES_NAVIGATION_SCREENS.menu,
  getEntryTarget: () => getCharadesMenuEntryTarget(),
  resolveAction: ({ context, current, action }) => {
    if (current.zoneId === CHARADES_NAVIGATION_ZONES.content) {
      if (action === 'left') {
        const nextRailTarget = getCharadesRailEntryTarget(context.activeView)
        return {
          type: 'move',
          zoneId: nextRailTarget.zoneId,
          targetId: nextRailTarget.targetId,
        }
      }

      if (action === 'menu') {
        return { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.menuOpenSettings }
      }

      if (action === 'confirm' || action === 'primary') {
        return { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.menuOpenSetup }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.rail) {
      const railTargets = context.railTargets.length > 0 ? context.railTargets : DEFAULT_RAIL_TARGETS

      if (action === 'up' || action === 'down') {
        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.rail,
          targetId: getNextTargetInList(
            railTargets,
            current.targetId,
            action === 'up' ? -1 : 1,
          ),
        }
      }

      if (action === 'right') {
        const nextContent = getCharadesMenuEntryTarget()
        return {
          type: 'move',
          zoneId: nextContent.zoneId,
          targetId: nextContent.targetId,
        }
      }

      if (action === 'confirm' || action === 'primary' || action === 'menu') {
        return { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.menuSelectRailTarget }
      }
    }

    return { type: 'stay' }
  },
}

export type { CharadesMenuNavigationContext }

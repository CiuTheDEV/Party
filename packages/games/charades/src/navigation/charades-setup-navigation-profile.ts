import type { HostNavigationProfile } from '@party/game-sdk'
import { CHARADES_NAVIGATION_COMMANDS } from './charades-navigation-actions'
import {
  CHARADES_NAVIGATION_SCREENS,
  CHARADES_NAVIGATION_TARGETS,
  CHARADES_NAVIGATION_ZONES,
  getCharadesSetupEntryTarget,
} from './charades-navigation-targets'

type CharadesSetupNavigationContext = {
  canStart: boolean
}

export const charadesSetupNavigationProfile: HostNavigationProfile<CharadesSetupNavigationContext> = {
  screenId: CHARADES_NAVIGATION_SCREENS.setup,
  getEntryTarget: () => getCharadesSetupEntryTarget(),
  resolveAction: ({ context, current, action }) => {
    if (action === 'back' || action === 'menu' || action === 'secondary') {
      return { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.setupClose }
    }

    if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
      return {
        type: 'move',
        zoneId: CHARADES_NAVIGATION_ZONES.dialog,
        targetId:
          current.targetId === CHARADES_NAVIGATION_TARGETS.setupStart
            ? CHARADES_NAVIGATION_TARGETS.setupClose
            : CHARADES_NAVIGATION_TARGETS.setupStart,
      }
    }

    if (action === 'confirm' || action === 'primary') {
      if (current.targetId === CHARADES_NAVIGATION_TARGETS.setupClose) {
        return { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.setupClose }
      }

      return context.canStart
        ? { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.setupStart }
        : { type: 'stay' }
    }

    return { type: 'stay' }
  },
}

export type { CharadesSetupNavigationContext }

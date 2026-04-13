import type { HostNavigationProfile } from '@party/game-sdk'
import { CODENAMES_NAVIGATION_COMMANDS } from './codenames-navigation-actions'
import {
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesSetupEntryTarget,
} from './codenames-navigation-targets'

type CodenamesSetupNavigationContext = {
  canStart: boolean
}

export const codenamesSetupNavigationProfile: HostNavigationProfile<CodenamesSetupNavigationContext> = {
  screenId: CODENAMES_NAVIGATION_SCREENS.setup,
  getEntryTarget: () => getCodenamesSetupEntryTarget(),
  resolveAction: ({ context, current, action }) => {
    if (action === 'back' || action === 'menu' || action === 'secondary') {
      return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.setupClose }
    }

    if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
      return {
        type: 'move',
        zoneId: CODENAMES_NAVIGATION_ZONES.dialog,
        targetId: current.targetId === CODENAMES_NAVIGATION_TARGETS.setupStart
          ? CODENAMES_NAVIGATION_TARGETS.setupClose
          : CODENAMES_NAVIGATION_TARGETS.setupStart,
      }
    }

    if (action === 'confirm' || action === 'primary') {
      if (current.targetId === CODENAMES_NAVIGATION_TARGETS.setupClose) {
        return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.setupClose }
      }
      return context.canStart
        ? { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.setupStart }
        : { type: 'stay' }
    }

    return { type: 'stay' }
  },
}

export type { CodenamesSetupNavigationContext }

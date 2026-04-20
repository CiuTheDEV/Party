import type { HostNavigationProfile } from '@party/game-sdk'
import { CHARADES_NAVIGATION_COMMANDS } from './charades-navigation-actions'
import {
  CHARADES_NAVIGATION_SCREENS,
  CHARADES_NAVIGATION_TARGETS,
  CHARADES_NAVIGATION_ZONES,
  getCharadesRuntimeEntryTarget,
} from './charades-navigation-targets'

type CharadesRuntimeNavigationContext = {
  canOpenVerdictPicker: boolean
  isPauseModalOpen: boolean
  isSettingsExitConfirmOpen: boolean
  isVerdictPickerOpen: boolean
}

export const charadesRuntimeNavigationProfile: HostNavigationProfile<CharadesRuntimeNavigationContext> = {
  screenId: CHARADES_NAVIGATION_SCREENS.runtime,
  getEntryTarget: () => getCharadesRuntimeEntryTarget(),
  resolveAction: ({ context, current, action }) => {
    if (current.zoneId === CHARADES_NAVIGATION_ZONES.runtime) {
      if (action === 'menu') {
        return {
          type: 'open-modal',
          screenId: CHARADES_NAVIGATION_SCREENS.runtime,
          zoneId: CHARADES_NAVIGATION_ZONES.runtimeSettings,
          targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseSound,
        }
      }

      if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimeVerdictCorrect) {
        if (action === 'right') {
          return {
            type: 'move',
            zoneId: CHARADES_NAVIGATION_ZONES.runtime,
            targetId: CHARADES_NAVIGATION_TARGETS.runtimeVerdictIncorrect,
          }
        }

        if (action === 'confirm' && context.canOpenVerdictPicker) {
          return {
            type: 'delegate',
            commandId: CHARADES_NAVIGATION_COMMANDS.runtimeOpenVerdictPicker,
          }
        }
      }

      if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimeVerdictIncorrect) {
        if (action === 'left') {
          return {
            type: 'move',
            zoneId: CHARADES_NAVIGATION_ZONES.runtime,
            targetId: CHARADES_NAVIGATION_TARGETS.runtimeVerdictCorrect,
          }
        }

        if (action === 'confirm') {
          return {
            type: 'delegate',
            commandId: CHARADES_NAVIGATION_COMMANDS.runtimeGiveIncorrectVerdict,
          }
        }
      }

      if (action === 'confirm') {
        return {
          type: 'delegate',
          commandId: CHARADES_NAVIGATION_COMMANDS.runtimePrimary,
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.runtimeSettings) {
      if (action === 'up') {
        if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseAnimations) {
          return { type: 'move', zoneId: current.zoneId, targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseSound }
        }

        if (
          current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseExit ||
          current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseContinue
        ) {
          return { type: 'move', zoneId: current.zoneId, targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseAnimations }
        }
      }

      if (action === 'down') {
        if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseSound) {
          return { type: 'move', zoneId: current.zoneId, targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseAnimations }
        }

        if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseAnimations) {
          return { type: 'move', zoneId: current.zoneId, targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseExit }
        }
      }

      if (action === 'left' && current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseContinue) {
        return { type: 'move', zoneId: current.zoneId, targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseExit }
      }

      if (action === 'right' && current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseExit) {
        return { type: 'move', zoneId: current.zoneId, targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseContinue }
      }

      if (action === 'back' || action === 'menu') {
        return {
          type: 'delegate',
          commandId: CHARADES_NAVIGATION_COMMANDS.runtimeCloseSettings,
        }
      }

      if (action === 'confirm') {
        if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseSound) {
          return {
            type: 'delegate',
            commandId: CHARADES_NAVIGATION_COMMANDS.runtimeToggleSettingsSound,
          }
        }

        if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseAnimations) {
          return {
            type: 'delegate',
            commandId: CHARADES_NAVIGATION_COMMANDS.runtimeToggleSettingsAnimations,
          }
        }

        if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseContinue) {
          return { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.runtimeCloseSettings }
        }

        if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseExit) {
          return { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.runtimeOpenSettingsExitConfirm }
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.runtimeSettingsConfirm) {
      if (action === 'left' || action === 'up') {
        return current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmExit
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmExit,
            }
      }

      if (action === 'right' || action === 'down') {
        return current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmStay
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmStay,
            }
      }

      if (action === 'back' || action === 'menu') {
        return {
          type: 'delegate',
          commandId: CHARADES_NAVIGATION_COMMANDS.runtimeCancelSettingsExitConfirm,
        }
      }

      if (action === 'confirm') {
        return current.targetId === CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmExit
          ? { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.runtimeExitToMenu }
          : { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.runtimeCancelSettingsExitConfirm }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.verdictPicker) {
      if (current.targetId === CHARADES_NAVIGATION_TARGETS.runtimeVerdictFirstPlayer) {
        if (action === 'back' || action === 'menu') {
          return { type: 'close-modal' }
        }

        if (action === 'confirm') {
          return {
            type: 'move',
            zoneId: current.zoneId,
            targetId: CHARADES_NAVIGATION_TARGETS.runtimeVerdictConfirm,
          }
        }

        return { type: 'stay' }
      }

      if (action === 'back' || action === 'menu') {
        return {
          type: 'move',
          zoneId: current.zoneId,
          targetId: CHARADES_NAVIGATION_TARGETS.runtimeVerdictFirstPlayer,
        }
      }

      if (action === 'left') {
        return {
          type: 'move',
          zoneId: current.zoneId,
          targetId: CHARADES_NAVIGATION_TARGETS.runtimeVerdictCancel,
        }
      }

      if (action === 'right') {
        return {
          type: 'move',
          zoneId: current.zoneId,
          targetId: CHARADES_NAVIGATION_TARGETS.runtimeVerdictConfirm,
        }
      }

      if (action === 'confirm') {
        return current.targetId === CHARADES_NAVIGATION_TARGETS.runtimeVerdictConfirm
          ? { type: 'delegate', commandId: CHARADES_NAVIGATION_COMMANDS.runtimeConfirmVerdict }
          : { type: 'close-modal' }
      }

      return { type: 'stay' }
    }

    return { type: 'stay' }
  },
}

export type { CharadesRuntimeNavigationContext }

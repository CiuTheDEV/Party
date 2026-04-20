import type { HostNavigationProfile } from '@party/game-sdk'
import { CODENAMES_NAVIGATION_COMMANDS } from './codenames-navigation-actions'
import {
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesRuntimeBoardTargetId,
  getCodenamesRuntimeEntryTarget,
  parseCodenamesRuntimeBoardTargetId,
} from './codenames-navigation-targets'

type CodenamesRuntimeNavigationContext = {
  boardCardCount: number
  isStatusRailOpen: boolean
}

function clampBoardIndex(index: number, boardCardCount: number) {
  if (boardCardCount <= 0) {
    return 0
  }

  return Math.max(0, Math.min(index, boardCardCount - 1))
}

export const codenamesRuntimeNavigationProfile: HostNavigationProfile<CodenamesRuntimeNavigationContext> = {
  screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
  getEntryTarget: () => getCodenamesRuntimeEntryTarget(),
  resolveAction: ({ context, current, action }) => {
    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeBoard) {
      const currentIndex = parseCodenamesRuntimeBoardTargetId(current.targetId) ?? 12
      const row = Math.floor(currentIndex / 5)
      const column = currentIndex % 5

      if (action === 'left') {
        return column === 0
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: getCodenamesRuntimeBoardTargetId(clampBoardIndex(currentIndex - 1, context.boardCardCount)),
            }
      }

      if (action === 'right') {
        if (column === 4 && context.isStatusRailOpen) {
          return {
            type: 'move',
            zoneId: CODENAMES_NAVIGATION_ZONES.runtimeStatusRail,
            targetId: CODENAMES_NAVIGATION_TARGETS.runtimeRailPanel,
          }
        }

        return column === 4
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: getCodenamesRuntimeBoardTargetId(clampBoardIndex(currentIndex + 1, context.boardCardCount)),
            }
      }

      if (action === 'up') {
        return row === 0
          ? {
              type: 'move',
              zoneId: CODENAMES_NAVIGATION_ZONES.runtimeCenterControls,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeCenterNewBoard,
            }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: getCodenamesRuntimeBoardTargetId(clampBoardIndex(currentIndex - 5, context.boardCardCount)),
            }
      }

      if (action === 'down') {
        return row >= 4
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: getCodenamesRuntimeBoardTargetId(clampBoardIndex(currentIndex + 5, context.boardCardCount)),
            }
      }

      if (action === 'confirm' || action === 'primary') {
        return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeRevealSelectedCard }
      }

      if (action === 'menu') {
        return {
          type: 'open-modal',
          screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
          zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettings,
          targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseSound,
        }
      }

      if (action === 'back' || action === 'secondary') {
        return {
          type: 'open-modal',
          screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
          zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBrowserExit,
          targetId: CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitStay,
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeCenterControls) {
      if (action === 'left') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeCenterSettings
          ? {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeCenterNewBoard,
            }
          : { type: 'stay' }
      }

      if (action === 'right') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeCenterNewBoard
          ? {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeCenterSettings,
            }
          : { type: 'stay' }
      }

      if (action === 'down') {
        return {
          type: 'move',
          zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBoard,
          targetId: getCodenamesRuntimeBoardTargetId(2),
        }
      }

      if (action === 'confirm') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeCenterNewBoard
          ? {
              type: 'open-modal',
              screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
              zoneId: CODENAMES_NAVIGATION_ZONES.runtimeResetConfirm,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeResetCancel,
            }
          : {
              type: 'open-modal',
              screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
              zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettings,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseSound,
            }
      }

      if (action === 'menu') {
        return {
          type: 'open-modal',
          screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
          zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettings,
          targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseSound,
        }
      }

      if (action === 'back') {
        return {
          type: 'open-modal',
          screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
          zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBrowserExit,
          targetId: CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitStay,
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeStatusRail) {
      if (action === 'left' || action === 'back') {
        return {
          type: 'move',
          zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBoard,
          targetId: getCodenamesRuntimeBoardTargetId(14),
        }
      }

      if (action === 'confirm' || action === 'menu') {
        return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeToggleStatusRail }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeSettings) {
      if (action === 'up') {
        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseAnimations) {
          return { type: 'move', zoneId: current.zoneId, targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseSound }
        }

        if (
          current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseExit ||
          current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseContinue
        ) {
          return { type: 'move', zoneId: current.zoneId, targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseAnimations }
        }
      }

      if (action === 'down') {
        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseSound) {
          return { type: 'move', zoneId: current.zoneId, targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseAnimations }
        }

        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseAnimations) {
          return { type: 'move', zoneId: current.zoneId, targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseExit }
        }
      }

      if (action === 'left' && current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseContinue) {
        return { type: 'move', zoneId: current.zoneId, targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseExit }
      }

      if (action === 'right' && current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseExit) {
        return { type: 'move', zoneId: current.zoneId, targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseContinue }
      }

      if (action === 'back' || action === 'menu') {
        return { type: 'close-modal' }
      }

      if (action === 'confirm') {
        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseSound) {
          return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeToggleSettingsSound }
        }

        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseAnimations) {
          return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeToggleSettingsAnimations }
        }

        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseExit) {
          return {
            type: 'open-modal',
            screenId: CODENAMES_NAVIGATION_SCREENS.runtime,
            zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettingsConfirm,
            targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmStay,
          }
        }

        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseContinue) {
          return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeCloseSettings }
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeSettingsConfirm) {
      if (action === 'left' || action === 'up') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmExit
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmExit,
            }
      }

      if (action === 'right' || action === 'down') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmStay
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmStay,
            }
      }

      if (action === 'back' || action === 'menu') {
        return { type: 'close-modal' }
      }

      if (action === 'confirm') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimePauseConfirmExit
          ? { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeExitToMenu }
          : { type: 'close-modal' }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeResetConfirm) {
      if (action === 'left' || action === 'up') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeResetCancel
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeResetCancel,
            }
      }

      if (action === 'right' || action === 'down') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeResetConfirm
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeResetConfirm,
            }
      }

      if (action === 'back' || action === 'menu') {
        return { type: 'close-modal' }
      }

      if (action === 'confirm') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeResetConfirm
          ? { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeConfirmReset }
          : { type: 'close-modal' }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeAssassin) {
      if (action === 'left') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeAssassinRed
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeAssassinRed,
            }
      }

      if (action === 'right') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeAssassinBlue
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeAssassinBlue,
            }
      }

      if (action === 'confirm') {
        return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeConfirmAssassinTeam }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeBrowserExit) {
      if (action === 'left' || action === 'up') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitStay
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitStay,
            }
      }

      if (action === 'right' || action === 'down') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitExit
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitExit,
            }
      }

      if (action === 'back' || action === 'menu') {
        return { type: 'close-modal' }
      }

      if (action === 'confirm') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeBrowserExitExit
          ? { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeExitToMenu }
          : { type: 'close-modal' }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.runtimeStartBlocked) {
      if (action === 'left' || action === 'up') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedClose
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedClose,
            }
      }

      if (action === 'right' || action === 'down') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedReset
          ? { type: 'stay' }
          : {
              type: 'move',
              zoneId: current.zoneId,
              targetId: CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedReset,
            }
      }

      if (action === 'back' || action === 'menu') {
        return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeCloseStartBlocked }
      }

      if (action === 'confirm') {
        return current.targetId === CODENAMES_NAVIGATION_TARGETS.runtimeStartBlockedReset
          ? { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeResetPoolAndRetry }
          : { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.runtimeCloseStartBlocked }
      }

      return { type: 'stay' }
    }

    return { type: 'stay' }
  },
}

export type { CodenamesRuntimeNavigationContext }

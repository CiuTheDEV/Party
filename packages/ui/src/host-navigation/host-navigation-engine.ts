import type {
  CreateHostNavigationStateInput,
  HostInputDevice,
  HostNavigationFocusSnapshot,
  HostNavigationState,
  HostNavigationTransition,
} from './host-navigation-types'

function toFocusSnapshot(input: HostNavigationFocusSnapshot): HostNavigationFocusSnapshot {
  return {
    screenId: input.screenId,
    zoneId: input.zoneId,
    targetId: input.targetId,
  }
}

export function createHostNavigationState(
  input: CreateHostNavigationStateInput,
): HostNavigationState {
  return {
    ...toFocusSnapshot(input),
    isAwake: input.isAwake ?? false,
    lastInputDevice: input.lastInputDevice ?? null,
    isControllerWakeGuardActive: false,
    modalOriginStack: [],
  }
}

export function sleepHostNavigation(
  state: HostNavigationState,
  device: HostInputDevice = 'mouse',
): HostNavigationState {
  return {
    ...state,
    isAwake: false,
    lastInputDevice: device,
    isControllerWakeGuardActive: false,
  }
}

export function wakeHostNavigation(
  state: HostNavigationState,
  device: Exclude<HostInputDevice, 'mouse'>,
): HostNavigationState {
  return {
    ...state,
    isAwake: true,
    lastInputDevice: device,
    isControllerWakeGuardActive: device === 'controller',
  }
}

export function updateControllerWakeGuard(
  state: HostNavigationState,
  isNeutral: boolean,
): HostNavigationState {
  if (!state.isControllerWakeGuardActive || !isNeutral) {
    return state
  }

  return {
    ...state,
    isControllerWakeGuardActive: false,
  }
}

export function applyHostNavigationTransition(
  state: HostNavigationState,
  transition: HostNavigationTransition,
): HostNavigationState {
  switch (transition.type) {
    case 'stay':
    case 'delegate':
    case 'close-modal':
      return state
    case 'move':
      return {
        ...state,
        zoneId: transition.zoneId,
        targetId: transition.targetId,
      }
    case 'open-modal':
      return openHostNavigationModal(state, {
        screenId: transition.screenId,
        zoneId: transition.zoneId,
        targetId: transition.targetId,
      })
    default:
      return state
  }
}

export function applyHostNavigationAction(
  state: HostNavigationState,
  input: {
    device: Exclude<HostInputDevice, 'mouse'>
    transition: HostNavigationTransition
  },
): HostNavigationState {
  const awakeState = state.isAwake ? state : wakeHostNavigation(state, input.device)

  if (!state.isAwake) {
    return awakeState
  }

  if (awakeState.isControllerWakeGuardActive && input.device === 'controller') {
    return awakeState
  }

  return {
    ...applyHostNavigationTransition(awakeState, input.transition),
    lastInputDevice: input.device,
  }
}

export function openHostNavigationModal(
  state: HostNavigationState,
  target: HostNavigationFocusSnapshot,
): HostNavigationState {
  return {
    ...state,
    ...toFocusSnapshot(target),
    modalOriginStack: [
      ...state.modalOriginStack,
      toFocusSnapshot(state),
    ],
  }
}

export function closeHostNavigationModal(
  state: HostNavigationState,
): HostNavigationState {
  const previousFocus = state.modalOriginStack[state.modalOriginStack.length - 1]

  if (!previousFocus) {
    return state
  }

  return {
    ...state,
    ...toFocusSnapshot(previousFocus),
    modalOriginStack: state.modalOriginStack.slice(0, -1),
  }
}

export type RuntimeInputDevice = 'mouse' | 'keyboard' | 'controller'

export type RuntimeInputState = {
  isAwake: boolean
  lastInputDevice: RuntimeInputDevice | null
  isControllerWakeGuardActive: boolean
}

export function createRuntimeInputState(
  input: {
    isAwake?: boolean
    lastInputDevice?: RuntimeInputDevice | null
  } = {},
): RuntimeInputState {
  return {
    isAwake: input.isAwake ?? false,
    lastInputDevice: input.lastInputDevice ?? null,
    isControllerWakeGuardActive: false,
  }
}

export function sleepRuntimeInput(
  state: RuntimeInputState,
  device: RuntimeInputDevice = 'mouse',
): RuntimeInputState {
  return {
    ...state,
    isAwake: false,
    lastInputDevice: device,
    isControllerWakeGuardActive: false,
  }
}

export function wakeRuntimeInput(
  state: RuntimeInputState,
  device: Exclude<RuntimeInputDevice, 'mouse'>,
): RuntimeInputState {
  return {
    ...state,
    isAwake: true,
    lastInputDevice: device,
    isControllerWakeGuardActive: device === 'controller',
  }
}

export function updateRuntimeControllerWakeGuard(
  state: RuntimeInputState,
  isNeutral: boolean,
): RuntimeInputState {
  if (!state.isControllerWakeGuardActive || !isNeutral) {
    return state
  }

  return {
    ...state,
    isControllerWakeGuardActive: false,
  }
}

export function shouldBlockRuntimeAction(
  state: RuntimeInputState,
  device: Exclude<RuntimeInputDevice, 'mouse'>,
): boolean {
  if (!state.isAwake) {
    return true
  }

  return state.isControllerWakeGuardActive && device === 'controller'
}

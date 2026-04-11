import { resolveHostControlAction, type HostControlAction, type HostControlDevice } from '../runtime/play/host-controls'

export type ResultsActionTarget = 'again' | 'menu'

export function resolveResultsAction(
  bindings: Record<string, string>,
  device: HostControlDevice,
  inputLabel: string,
): HostControlAction | null {
  return resolveHostControlAction(bindings, device, inputLabel)
}

export function getNextResultsActionTarget(
  current: ResultsActionTarget,
  action: HostControlAction,
): ResultsActionTarget {
  if (action === 'left') {
    return 'again'
  }

  if (action === 'right') {
    return 'menu'
  }

  return current
}

import { resolveHostControlAction, type HostControlsContext } from './host-controls'

type RuntimeOverlayContext = Pick<HostControlsContext, 'isSettingsOpen' | 'isVerdictPickerOpen'>

export function resolveRuntimeHostAction(
  context: RuntimeOverlayContext,
  bindings: Record<string, string>,
  device: 'keyboard' | 'controller',
  inputLabel: string,
) {
  return resolveHostControlAction(bindings, device, inputLabel)
}

export function shouldReportControllerDevice(previousSnapshot: object | null, inputLabel: string | null) {
  return previousSnapshot !== null && Boolean(inputLabel)
}

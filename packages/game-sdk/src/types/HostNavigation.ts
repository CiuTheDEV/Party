export type HostInputDevice = 'keyboard' | 'controller' | 'mouse'

export type HostNavigationAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'back'
  | 'menu'
  | 'next'
  | 'previous'
  | 'primary'
  | 'secondary'

export type HostNavigationTarget = {
  zoneId: string
  targetId: string
}

export type HostNavigationTransition =
  | { type: 'stay' }
  | { type: 'move'; zoneId: string; targetId: string }
  | { type: 'open-modal'; screenId: string; zoneId: string; targetId: string }
  | { type: 'close-modal' }
  | { type: 'delegate'; commandId: string }

export type HostNavigationProfile<TContext = void> = {
  screenId: string
  getEntryTarget: (context: TContext) => HostNavigationTarget
  resolveAction: (args: {
    context: TContext
    current: HostNavigationTarget
    action: HostNavigationAction
  }) => HostNavigationTransition
}

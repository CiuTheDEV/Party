import type { HostInputDevice, HostNavigationAction, HostNavigationProfile, HostNavigationTarget, HostNavigationTransition } from '@party/game-sdk';
export type { HostInputDevice, HostNavigationAction, HostNavigationProfile, HostNavigationTarget, HostNavigationTransition, };
export type HostNavigationFocusSnapshot = {
    screenId: string;
    zoneId: string;
    targetId: string;
};
export type HostNavigationState = HostNavigationFocusSnapshot & {
    isAwake: boolean;
    lastInputDevice: HostInputDevice | null;
    isControllerWakeGuardActive: boolean;
    modalOriginStack: HostNavigationFocusSnapshot[];
};
export type CreateHostNavigationStateInput = HostNavigationFocusSnapshot & {
    isAwake?: boolean;
    lastInputDevice?: HostInputDevice | null;
};
export type HostNavigationInputSource = {
    device: Exclude<HostInputDevice, 'mouse'>;
    inputLabel?: string;
};
export type FixedHostNavigationInputMap = {
    keyboard: Partial<Record<string, HostNavigationAction>>;
    controller: Partial<Record<string, HostNavigationAction>>;
};
//# sourceMappingURL=host-navigation-types.d.ts.map
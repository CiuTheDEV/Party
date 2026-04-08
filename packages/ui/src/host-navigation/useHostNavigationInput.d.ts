import type { FixedHostNavigationInputMap, HostInputDevice, HostNavigationAction } from './host-navigation-types';
export declare const DEFAULT_FIXED_HOST_NAVIGATION_INPUTS: FixedHostNavigationInputMap;
export declare function resolveFixedHostNavigationAction(device: Exclude<HostInputDevice, 'mouse'>, inputLabel: string, inputMap?: FixedHostNavigationInputMap): HostNavigationAction | null;
type UseHostNavigationInputOptions = {
    enabled?: boolean;
    onAction: (action: HostNavigationAction, input: {
        device: 'keyboard';
        inputLabel: string;
    }) => void;
};
export declare function useHostNavigationInput({ enabled, onAction, }: UseHostNavigationInputOptions): void;
export {};
//# sourceMappingURL=useHostNavigationInput.d.ts.map
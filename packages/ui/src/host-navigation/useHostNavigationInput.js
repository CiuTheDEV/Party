'use client';
import { useEffect } from 'react';
export const DEFAULT_FIXED_HOST_NAVIGATION_INPUTS = {
    keyboard: {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        Enter: 'confirm',
        Escape: 'back',
        Tab: 'menu',
    },
    controller: {
        'D-Pad Left': 'left',
        'D-Pad Right': 'right',
        'D-Pad Up': 'up',
        'D-Pad Down': 'down',
        'L Stick Left': 'left',
        'L Stick Right': 'right',
        'L Stick Up': 'up',
        'L Stick Down': 'down',
        'A / Cross': 'confirm',
        'B / Circle': 'back',
        Start: 'menu',
        Menu: 'menu',
    },
};
const KEYBOARD_INPUT_ALIASES = {
    'Arrow Left': 'ArrowLeft',
    'Arrow Right': 'ArrowRight',
    'Arrow Up': 'ArrowUp',
    'Arrow Down': 'ArrowDown',
    Esc: 'Escape',
};
export function resolveFixedHostNavigationAction(device, inputLabel, inputMap = DEFAULT_FIXED_HOST_NAVIGATION_INPUTS) {
    var _a, _b;
    const normalizedLabel = device === 'keyboard'
        ? (_a = KEYBOARD_INPUT_ALIASES[inputLabel]) !== null && _a !== void 0 ? _a : inputLabel
        : inputLabel;
    return (_b = inputMap[device][normalizedLabel]) !== null && _b !== void 0 ? _b : null;
}
export function useHostNavigationInput({ enabled = true, onAction, }) {
    useEffect(() => {
        if (!enabled) {
            return;
        }
        function handleKeyDown(event) {
            if (event.repeat) {
                return;
            }
            const action = resolveFixedHostNavigationAction('keyboard', event.key);
            if (!action) {
                return;
            }
            event.preventDefault();
            onAction(action, {
                device: 'keyboard',
                inputLabel: event.key,
            });
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, onAction]);
}

export type BoardKeyOverlayVariant = 1

export const BOARD_KEY_OVERLAY_AUTO_REVEAL_ON_END = false

export const BOARD_KEY_OVERLAY_DEFAULT_VARIANT: BoardKeyOverlayVariant = 1

export const BOARD_KEY_OVERLAY_VARIANTS = [
  { id: 1 as const, label: '1', skill: 'frontend-design' },
] as const

export function isBoardKeyOverlayVariant(value: number): value is BoardKeyOverlayVariant {
  return BOARD_KEY_OVERLAY_VARIANTS.some((variant) => variant.id === value)
}

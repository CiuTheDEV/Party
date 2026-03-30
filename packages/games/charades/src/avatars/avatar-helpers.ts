import {
  CHARADES_AVATARS,
  CHARADES_AVATAR_CATEGORY_LABELS,
  DEFAULT_CHARADES_AVATAR_ID,
  type CharadesAvatarAsset,
  type CharadesAvatarCategory,
  type CharadesAvatarVariant,
} from './avatar-registry'

const AVATARS_BY_ID = new Map(CHARADES_AVATARS.map((avatar) => [avatar.id, avatar]))
const LEGACY_GLYPH_TO_ID = new Map(
  CHARADES_AVATARS.flatMap((avatar) => (avatar.legacyGlyph ? [[avatar.legacyGlyph, avatar.id] as const] : [])),
)

export function getCharadesAvatarCategories() {
  return Object.entries(CHARADES_AVATAR_CATEGORY_LABELS).map(([id, label]) => ({
    id: id as CharadesAvatarCategory,
    label,
  }))
}

export function getCharadesAvatarsByCategory(category: CharadesAvatarCategory) {
  return CHARADES_AVATARS.filter((avatar) => avatar.category === category)
}

export function getCharadesAvatarById(avatarId: string | null | undefined): CharadesAvatarAsset {
  const normalizedId = normalizeCharadesAvatarId(avatarId)
  return AVATARS_BY_ID.get(normalizedId) ?? AVATARS_BY_ID.get(DEFAULT_CHARADES_AVATAR_ID)!
}

export function normalizeCharadesAvatarId(avatarId: string | null | undefined) {
  if (!avatarId) {
    return DEFAULT_CHARADES_AVATAR_ID
  }

  if (AVATARS_BY_ID.has(avatarId)) {
    return avatarId
  }

  return LEGACY_GLYPH_TO_ID.get(avatarId) ?? DEFAULT_CHARADES_AVATAR_ID
}

export function getCharadesAvatarAssetSrc(
  avatarId: string | null | undefined,
  variant: CharadesAvatarVariant = 'static',
) {
  const avatar = getCharadesAvatarById(avatarId)

  return variant === 'animated'
    ? {
        src: avatar.animatedSrc,
        webpSrc: avatar.animatedWebpSrc,
      }
    : {
        src: avatar.staticSrc,
        webpSrc: null,
      }
}

export function normalizeCharadesPlayers<T extends { avatar: string }>(players: T[] | null | undefined) {
  return (players ?? []).map((player) => ({
    ...player,
    avatar: normalizeCharadesAvatarId(player.avatar),
  }))
}


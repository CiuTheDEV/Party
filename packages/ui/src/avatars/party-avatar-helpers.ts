import {
  DEFAULT_PARTY_AVATAR_ID,
  PARTY_AVATARS,
  PARTY_AVATAR_CATEGORY_LABELS,
  type PartyAvatarAsset,
  type PartyAvatarCategory,
  type PartyAvatarVariant,
} from './party-avatar-registry'

const AVATARS_BY_ID = new Map(PARTY_AVATARS.map((avatar) => [avatar.id, avatar]))
const LEGACY_GLYPH_TO_ID = new Map(
  PARTY_AVATARS.flatMap((avatar) => (avatar.legacyGlyph ? [[avatar.legacyGlyph, avatar.id] as const] : [])),
)

export function getPartyAvatarCategories() {
  return Object.entries(PARTY_AVATAR_CATEGORY_LABELS).map(([id, label]) => ({
    id: id as PartyAvatarCategory,
    label,
  }))
}

export function getPartyAvatarsByCategory(category: PartyAvatarCategory) {
  return PARTY_AVATARS.filter((avatar) => avatar.category === category)
}

export function getPartyAvatarById(avatarId: string | null | undefined): PartyAvatarAsset {
  const normalizedId = normalizePartyAvatarId(avatarId)
  return AVATARS_BY_ID.get(normalizedId) ?? AVATARS_BY_ID.get(DEFAULT_PARTY_AVATAR_ID)!
}

export function normalizePartyAvatarId(avatarId: string | null | undefined) {
  if (!avatarId) {
    return DEFAULT_PARTY_AVATAR_ID
  }

  if (AVATARS_BY_ID.has(avatarId)) {
    return avatarId
  }

  return LEGACY_GLYPH_TO_ID.get(avatarId) ?? DEFAULT_PARTY_AVATAR_ID
}

export function getPartyAvatarAssetSrc(
  avatarId: string | null | undefined,
  variant: PartyAvatarVariant = 'static',
) {
  const avatar = getPartyAvatarById(avatarId)

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

export function normalizePartyPlayers<T extends { avatar: string }>(players: T[] | null | undefined) {
  return (players ?? []).map((player) => ({
    ...player,
    avatar: normalizePartyAvatarId(player.avatar),
  }))
}

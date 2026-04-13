import { useEffect, useState } from 'react'
import { getPartyAvatarById } from '../avatars/party-avatar-helpers'
import type { PartyAvatarVariant } from '../avatars/party-avatar-registry'
import styles from './AvatarAsset.module.css'

type Props = {
  avatar: string | null | undefined
  variant?: PartyAvatarVariant
  alt?: string
  className?: string
  imageClassName?: string
  size?: number | string
}

type RenderMode = 'animated' | 'static' | 'glyph'

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function AvatarAsset({
  avatar,
  variant = 'static',
  alt = '',
  className,
  imageClassName,
  size,
}: Props) {
  const resolvedAvatar = getPartyAvatarById(avatar)
  const [mode, setMode] = useState<RenderMode>(variant === 'animated' ? 'animated' : 'static')
  const resolvedSize = typeof size === 'number' ? `${size}px` : size
  const assetStyle = resolvedSize ? { width: resolvedSize, height: resolvedSize } : undefined

  useEffect(() => {
    setMode(variant === 'animated' ? 'animated' : 'static')
  }, [resolvedAvatar.id, variant])

  const imageSrc =
    mode === 'animated'
      ? resolvedAvatar.animatedSrc
      : mode === 'static'
        ? resolvedAvatar.staticSrc
        : null

  function handleError() {
    if (mode === 'animated') {
      setMode('static')
      return
    }

    if (mode === 'static' && resolvedAvatar.legacyGlyph) {
      setMode('glyph')
    }
  }

  return (
    <span className={joinClassNames(styles.asset, className)} style={assetStyle}>
      {mode === 'glyph' && resolvedAvatar.legacyGlyph ? (
        <span className={joinClassNames(styles.glyph, imageClassName)} aria-label={alt || resolvedAvatar.label}>
          {resolvedAvatar.legacyGlyph}
        </span>
      ) : imageSrc ? (
        <img
          className={joinClassNames(styles.image, imageClassName)}
          src={imageSrc}
          alt={alt || resolvedAvatar.label}
          loading="eager"
          draggable={false}
          onError={handleError}
        />
      ) : null}
    </span>
  )
}

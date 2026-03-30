import { useEffect, useState } from 'react'
import styles from './AvatarAsset.module.css'
import { getCharadesAvatarById } from './avatar-helpers'
import type { CharadesAvatarVariant } from './avatar-registry'

type Props = {
  avatar: string | null | undefined
  variant?: CharadesAvatarVariant
  alt?: string
  className?: string
  imageClassName?: string
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
}: Props) {
  const resolvedAvatar = getCharadesAvatarById(avatar)
  const [mode, setMode] = useState<RenderMode>(variant === 'animated' ? 'animated' : 'static')

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
    <span className={joinClassNames(styles.asset, className)}>
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

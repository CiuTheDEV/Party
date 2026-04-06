export type LibraryCardMedia =
  | {
      kind: 'image'
      src: string
    }
  | {
      kind: 'video'
      src: string
      poster?: string
    }

export type LibraryCardMediaInput = {
  imagePath?: string
  videoPath?: string
}

export function resolveLibraryCardMedia(card: LibraryCardMediaInput): LibraryCardMedia | null {
  if (card.videoPath) {
    return {
      kind: 'video',
      src: card.videoPath,
      poster: card.imagePath,
    }
  }

  if (card.imagePath) {
    return {
      kind: 'image',
      src: card.imagePath,
    }
  }

  return null
}

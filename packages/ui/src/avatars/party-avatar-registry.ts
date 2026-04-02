export type PartyAvatarCategory = 'people' | 'animals' | 'other'

export type PartyAvatarVariant = 'static' | 'animated'

export type PartyAvatarAsset = {
  id: string
  label: string
  category: PartyAvatarCategory
  codepoint: string
  staticSrc: string
  animatedSrc: string
  animatedWebpSrc: string
  legacyGlyph?: string
}

const NOTO_EMOJI_BASE_URL = 'https://fonts.gstatic.com/s/e/notoemoji/latest'

function buildAsset({
  id,
  label,
  category,
  codepoint,
  legacyGlyph,
}: {
  id: string
  label: string
  category: PartyAvatarCategory
  codepoint: string
  legacyGlyph?: string
}): PartyAvatarAsset {
  return {
    id,
    label,
    category,
    codepoint,
    staticSrc: `${NOTO_EMOJI_BASE_URL}/${codepoint}/emoji.svg`,
    animatedSrc: `${NOTO_EMOJI_BASE_URL}/${codepoint}/512.gif`,
    animatedWebpSrc: `${NOTO_EMOJI_BASE_URL}/${codepoint}/512.webp`,
    legacyGlyph,
  }
}

export const PARTY_AVATAR_CATEGORY_LABELS: Record<PartyAvatarCategory, string> = {
  people: 'Ludzie',
  animals: 'Zwierzeta',
  other: 'Inne',
}

export const DEFAULT_PARTY_AVATAR_ID = 'smile'

export const PARTY_AVATARS: readonly PartyAvatarAsset[] = [
  buildAsset({ id: 'smile', label: 'Usmiech', category: 'people', codepoint: '1f600', legacyGlyph: '\u{1F600}' }),
  buildAsset({ id: 'sunglasses', label: 'Okulary', category: 'people', codepoint: '1f60e', legacyGlyph: '\u{1F60E}' }),
  buildAsset({ id: 'star-struck', label: 'Zachwyt', category: 'people', codepoint: '1f929', legacyGlyph: '\u{1F929}' }),
  buildAsset({ id: 'partying-face', label: 'Imprezka', category: 'people', codepoint: '1f973', legacyGlyph: '\u{1F973}' }),
  buildAsset({ id: 'smile-cat', label: 'Koci-usmiech', category: 'people', codepoint: '1f63a', legacyGlyph: '\u{1F63A}' }),
  buildAsset({ id: 'nerd-face', label: 'Madrala', category: 'people', codepoint: '1f913', legacyGlyph: '\u{1F913}' }),
  buildAsset({ id: 'tongue-face', label: 'Zartownis', category: 'people', codepoint: '1f61c', legacyGlyph: '\u{1F61C}' }),
  buildAsset({ id: 'monocle-face', label: 'Monokl', category: 'people', codepoint: '1f9d0', legacyGlyph: '\u{1F9D0}' }),
  buildAsset({ id: 'angel-face', label: 'Aniol', category: 'people', codepoint: '1f607', legacyGlyph: '\u{1F607}' }),
  buildAsset({ id: 'cowboy-face', label: 'Kowboj', category: 'people', codepoint: '1f920', legacyGlyph: '\u{1F920}' }),
  buildAsset({ id: 'ghost', label: 'Duszek', category: 'people', codepoint: '1f47b', legacyGlyph: '\u{1F47B}' }),
  buildAsset({ id: 'beaming-face', label: 'Radosc', category: 'people', codepoint: '1f601', legacyGlyph: '\u{1F601}' }),
  buildAsset({ id: 'laughing-face', label: 'Smiech', category: 'people', codepoint: '1f606', legacyGlyph: '\u{1F606}' }),
  buildAsset({ id: 'wink-face', label: 'Perskie-oko', category: 'people', codepoint: '1f609', legacyGlyph: '\u{1F609}' }),
  buildAsset({ id: 'cool-face', label: 'Luzak', category: 'people', codepoint: '1f60f', legacyGlyph: '\u{1F60F}' }),
  buildAsset({ id: 'mind-blown', label: 'Szok', category: 'people', codepoint: '1f92f', legacyGlyph: '\u{1F92F}' }),
  buildAsset({ id: 'alien', label: 'Kosmita', category: 'people', codepoint: '1f47d', legacyGlyph: '\u{1F47D}' }),
  buildAsset({ id: 'joy-face', label: 'Beksa-ze-smiechu', category: 'people', codepoint: '1f602', legacyGlyph: '\u{1F602}' }),
  buildAsset({ id: 'heart-eyes', label: 'Zauroczony', category: 'people', codepoint: '1f60d', legacyGlyph: '\u{1F60D}' }),
  buildAsset({ id: 'kissing-face', label: 'Calus', category: 'people', codepoint: '1f618', legacyGlyph: '\u{1F618}' }),
  buildAsset({ id: 'thinking-face', label: 'Mysliciel', category: 'people', codepoint: '1f914', legacyGlyph: '\u{1F914}' }),
  buildAsset({ id: 'shushing-face', label: 'Ciii', category: 'people', codepoint: '1f92b', legacyGlyph: '\u{1F92B}' }),
  buildAsset({ id: 'sleepy-face', label: 'Spiacy', category: 'people', codepoint: '1f62a', legacyGlyph: '\u{1F62A}' }),
  buildAsset({ id: 'drooling-face', label: 'Lakomczuch', category: 'people', codepoint: '1f924', legacyGlyph: '\u{1F924}' }),
  buildAsset({ id: 'robot-face', label: 'Robot', category: 'people', codepoint: '1f916', legacyGlyph: '\u{1F916}' }),
  buildAsset({ id: 'clown-face', label: 'Klaun', category: 'people', codepoint: '1f921', legacyGlyph: '\u{1F921}' }),
  buildAsset({ id: 'poop', label: 'Glupek', category: 'people', codepoint: '1f4a9', legacyGlyph: '\u{1F4A9}' }),
  buildAsset({ id: 'dog', label: 'Pudel', category: 'animals', codepoint: '1f429', legacyGlyph: '\u{1F429}' }),
  buildAsset({ id: 'cat', label: 'Kot', category: 'animals', codepoint: '1f431', legacyGlyph: '\u{1F431}' }),
  buildAsset({ id: 'bear', label: 'Niedzwiedz', category: 'animals', codepoint: '1f43b', legacyGlyph: '\u{1F43B}' }),
  buildAsset({ id: 'fox', label: 'Lis', category: 'animals', codepoint: '1f98a', legacyGlyph: '\u{1F98A}' }),
  buildAsset({ id: 'tiger', label: 'Tygrys', category: 'animals', codepoint: '1f405', legacyGlyph: '\u{1F405}' }),
  buildAsset({ id: 'lion', label: 'Lew', category: 'animals', codepoint: '1f981', legacyGlyph: '\u{1F981}' }),
  buildAsset({ id: 'frog', label: 'Zaba', category: 'animals', codepoint: '1f438', legacyGlyph: '\u{1F438}' }),
  buildAsset({ id: 'pig', label: 'Krowa', category: 'animals', codepoint: '1f42e', legacyGlyph: '\u{1F42E}' }),
  buildAsset({ id: 'koala', label: 'Waz', category: 'animals', codepoint: '1f40d', legacyGlyph: '\u{1F40D}' }),
  buildAsset({ id: 'unicorn', label: 'Jednorozec', category: 'animals', codepoint: '1f984', legacyGlyph: '\u{1F984}' }),
  buildAsset({ id: 'wolf', label: 'Wilk', category: 'animals', codepoint: '1f43a', legacyGlyph: '\u{1F43A}' }),
  buildAsset({ id: 'owl', label: 'Sowa', category: 'animals', codepoint: '1f989', legacyGlyph: '\u{1F989}' }),
  buildAsset({ id: 'rabbit', label: 'Wiewiorka', category: 'animals', codepoint: '1f43f', legacyGlyph: '\u{1F43F}' }),
  buildAsset({ id: 'mouse', label: 'Jaszczurka', category: 'animals', codepoint: '1f98e', legacyGlyph: '\u{1F98E}' }),
  buildAsset({ id: 'panda', label: 'Panda', category: 'animals', codepoint: '1f43c', legacyGlyph: '\u{1F43C}' }),
  buildAsset({ id: 'monkey', label: 'Zolw', category: 'animals', codepoint: '1f422', legacyGlyph: '\u{1F422}' }),
  buildAsset({ id: 'penguin', label: 'Pingwin', category: 'animals', codepoint: '1f427', legacyGlyph: '\u{1F427}' }),
  buildAsset({ id: 'dragon', label: 'Smok', category: 'animals', codepoint: '1f409', legacyGlyph: '\u{1F409}' }),
  buildAsset({ id: 'chicken', label: 'Golab', category: 'animals', codepoint: '1f54a', legacyGlyph: '\u{1F54A}' }),
  buildAsset({ id: 'duck', label: 'Krokodyl', category: 'animals', codepoint: '1f40a', legacyGlyph: '\u{1F40A}' }),
  buildAsset({ id: 'eagle', label: 'Orzel', category: 'animals', codepoint: '1f985', legacyGlyph: '\u{1F985}' }),
  buildAsset({ id: 'shark', label: 'Rekin', category: 'animals', codepoint: '1f988', legacyGlyph: '\u{1F988}' }),
  buildAsset({ id: 'octopus', label: 'Osmiornica', category: 'animals', codepoint: '1f419', legacyGlyph: '\u{1F419}' }),
  buildAsset({ id: 'butterfly', label: 'Motyl', category: 'animals', codepoint: '1f98b', legacyGlyph: '\u{1F98B}' }),
  buildAsset({ id: 'snail', label: 'Slimak', category: 'animals', codepoint: '1f40c', legacyGlyph: '\u{1F40C}' }),
  buildAsset({ id: 'lady-beetle', label: 'Biedronka', category: 'animals', codepoint: '1f41e', legacyGlyph: '\u{1F41E}' }),
  buildAsset({ id: 'whale', label: 'Wieloryb', category: 'animals', codepoint: '1f433', legacyGlyph: '\u{1F433}' }),
  buildAsset({ id: 'dolphin', label: 'Delfin', category: 'animals', codepoint: '1f42c', legacyGlyph: '\u{1F42C}' }),
  buildAsset({ id: 'theater', label: 'Maski', category: 'other', codepoint: '1f3ad', legacyGlyph: '\u{1F3AD}' }),
  buildAsset({ id: 'circus', label: 'Blask', category: 'other', codepoint: '1f31f', legacyGlyph: '\u{1F31F}' }),
  buildAsset({ id: 'palette', label: 'Tecza', category: 'other', codepoint: '1f308', legacyGlyph: '\u{1F308}' }),
  buildAsset({ id: 'clapper', label: 'Klapser', category: 'other', codepoint: '1f3ac', legacyGlyph: '\u{1F3AC}' }),
  buildAsset({ id: 'microphone', label: 'Trabka', category: 'other', codepoint: '1f3ba', legacyGlyph: '\u{1F3BA}' }),
  buildAsset({ id: 'guitar', label: 'Gitara', category: 'other', codepoint: '1f3b8', legacyGlyph: '\u{1F3B8}' }),
  buildAsset({ id: 'dart', label: 'Rzutki', category: 'other', codepoint: '1f3af', legacyGlyph: '\u{1F3AF}' }),
  buildAsset({ id: 'trophy', label: 'Trofeum', category: 'other', codepoint: '1f3c6', legacyGlyph: '\u{1F3C6}' }),
  buildAsset({ id: 'star', label: 'Gwiazda', category: 'other', codepoint: '2b50', legacyGlyph: '\u{2B50}' }),
  buildAsset({ id: 'fire', label: 'Ognien', category: 'other', codepoint: '1f525', legacyGlyph: '\u{1F525}' }),
  buildAsset({ id: 'gem', label: 'Klejnot', category: 'other', codepoint: '1f48e', legacyGlyph: '\u{1F48E}' }),
  buildAsset({ id: 'rocket', label: 'Rakieta', category: 'other', codepoint: '1f680', legacyGlyph: '\u{1F680}' }),
  buildAsset({ id: 'lightning', label: 'Piorun', category: 'other', codepoint: '26a1', legacyGlyph: '\u{26A1}' }),
  buildAsset({ id: 'soccer-ball', label: 'Pilka', category: 'other', codepoint: '26bd', legacyGlyph: '\u{26BD}' }),
  buildAsset({ id: 'dice', label: 'Kostka', category: 'other', codepoint: '1f3b2', legacyGlyph: '\u{1F3B2}' }),
  buildAsset({ id: 'crown', label: 'Korona', category: 'other', codepoint: '1f451', legacyGlyph: '\u{1F451}' }),
  buildAsset({ id: 'headphones', label: 'Saksofon', category: 'other', codepoint: '1f3b7', legacyGlyph: '\u{1F3B7}' }),
  buildAsset({ id: 'basketball', label: 'Kosz', category: 'other', codepoint: '1f3c0', legacyGlyph: '\u{1F3C0}' }),
  buildAsset({ id: 'volleyball', label: 'Beben', category: 'other', codepoint: '1f941', legacyGlyph: '\u{1F941}' }),
  buildAsset({ id: 'gamepad', label: 'Laptop', category: 'other', codepoint: '1f4bb', legacyGlyph: '\u{1F4BB}' }),
  buildAsset({ id: 'joystick', label: 'Telewizor', category: 'other', codepoint: '1f4fa', legacyGlyph: '\u{1F4FA}' }),
  buildAsset({ id: 'camera', label: 'Kamera-filmowa', category: 'other', codepoint: '1f3a5', legacyGlyph: '\u{1F3A5}' }),
  buildAsset({ id: 'movie-camera', label: 'Kamera', category: 'other', codepoint: '1f3a5', legacyGlyph: '\u{1F3A5}' }),
  buildAsset({ id: 'books', label: 'Ksiazki', category: 'other', codepoint: '1f4da', legacyGlyph: '\u{1F4DA}' }),
  buildAsset({ id: 'magic-wand', label: 'Rozdzka', category: 'other', codepoint: '1fa84', legacyGlyph: '\u{1FA84}' }),
  buildAsset({ id: 'saturn', label: 'Saturn', category: 'other', codepoint: '1fa90', legacyGlyph: '\u{1FA90}' }),
  buildAsset({ id: 'crystal-ball', label: 'Kula', category: 'other', codepoint: '1f52e', legacyGlyph: '\u{1F52E}' }),
] as const

export type WholeWordCandidate = {
  lines: string[]
}

export type EstimateLayoutInput = {
  candidate: WholeWordCandidate
  width: number
  height: number
  maxFontSize: number
  minFontSize: number
  lineHeight: number
  horizontalPadding: number
  verticalPadding: number
  averageGlyphWidth: number
}

export type EstimatedLayoutCandidate = WholeWordCandidate & {
  fontSize: number
  fits: boolean
  score: number
}

export type AutoscaledWordLayoutResult = {
  lines: string[]
  fontSize: number
}

export function getLineBalancePenalty(lines: string[]) {
  const lineLengths = lines.map((line) => line.trim().length).filter((length) => length > 0)

  if (lineLengths.length <= 1) {
    return 0
  }

  const longest = Math.max(...lineLengths)
  const shortest = Math.min(...lineLengths)
  const average = lineLengths.reduce((sum, length) => sum + length, 0) / lineLengths.length
  const variance =
    lineLengths.reduce((sum, length) => sum + (length - average) ** 2, 0) / lineLengths.length
  const spreadPenalty = longest === 0 ? 0 : (longest - shortest) / longest
  const variancePenalty = average === 0 ? 0 : Math.sqrt(variance) / average
  const hangingPrefixPenalty = lineLengths.slice(0, -1).reduce((sum, length) => {
    const ratio = longest === 0 ? 1 : length / longest

    if (ratio >= 0.58) {
      return sum
    }

    if (ratio < 0.34) {
      return sum + 1.25
    }

    return sum + 0.55
  }, 0)

  return spreadPenalty * 1.7 + variancePenalty * 1.2 + hangingPrefixPenalty
}

export function tokenizeWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean)
}

export function buildLineText(words: string[]) {
  return words.join(' ')
}

export function generateWholeWordLineCandidates(text: string) {
  const words = tokenizeWords(text)

  if (words.length === 0) {
    return [{ lines: [''] }]
  }

  const candidates: WholeWordCandidate[] = [{ lines: [buildLineText(words)] }]

  for (let firstBreak = 1; firstBreak < words.length; firstBreak += 1) {
    candidates.push({
      lines: [buildLineText(words.slice(0, firstBreak)), buildLineText(words.slice(firstBreak))],
    })
  }

  for (let firstBreak = 1; firstBreak < words.length - 1; firstBreak += 1) {
    for (let secondBreak = firstBreak + 1; secondBreak < words.length; secondBreak += 1) {
      candidates.push({
        lines: [
          buildLineText(words.slice(0, firstBreak)),
          buildLineText(words.slice(firstBreak, secondBreak)),
          buildLineText(words.slice(secondBreak)),
        ],
      })
    }
  }

  return candidates
}

export function estimateLayoutCandidate({
  candidate,
  width,
  height,
  maxFontSize,
  minFontSize,
  lineHeight,
  horizontalPadding,
  verticalPadding,
  averageGlyphWidth,
}: EstimateLayoutInput): EstimatedLayoutCandidate {
  const innerWidth = Math.max(width - horizontalPadding * 2, 1)
  const innerHeight = Math.max(height - verticalPadding * 2, 1)
  const longestLineLength = candidate.lines.reduce((max, line) => Math.max(max, line.length), 0)
  const widthLimitedFont =
    longestLineLength > 0 ? innerWidth / (longestLineLength * averageGlyphWidth) : maxFontSize
  const heightLimitedFont = innerHeight / Math.max(candidate.lines.length * lineHeight, 1)
  const fontSize = Math.max(minFontSize, Math.min(maxFontSize, widthLimitedFont, heightLimitedFont))
  const fits = fontSize <= widthLimitedFont + 0.001 && fontSize <= heightLimitedFont + 0.001
  const usedWidthRatio =
    longestLineLength > 0 ? Math.min((longestLineLength * fontSize * averageGlyphWidth) / innerWidth, 1) : 1
  const usedHeightRatio = Math.min((candidate.lines.length * fontSize * lineHeight) / innerHeight, 1)
  const balancePenalty = getLineBalancePenalty(candidate.lines)
  const score = fontSize * 4 + usedWidthRatio * 80 + usedHeightRatio * 64 - balancePenalty * 28

  return {
    ...candidate,
    fontSize,
    fits,
    score,
  }
}

export function chooseBestWholeWordLayout(input: Omit<EstimateLayoutInput, 'candidate'> & { text: string }) {
  const estimates = generateWholeWordLineCandidates(input.text)
    .map((candidate) => estimateLayoutCandidate({ ...input, candidate }))
    .filter((candidate) => candidate.fits)
    .sort((left, right) => right.score - left.score)

  return estimates[0]
}

export function resolveAutoscaledWordLayout(
  input:
    | (Omit<EstimateLayoutInput, 'candidate'> & { text: string; strategy: 'whole-word' })
    | { text: string; strategy: 'css-wrap'; fontSize: number },
): AutoscaledWordLayoutResult {
  if (input.strategy === 'css-wrap') {
    return {
      lines: [input.text],
      fontSize: input.fontSize,
    }
  }

  const best = chooseBestWholeWordLayout(input)

  if (best) {
    return {
      lines: best.lines,
      fontSize: best.fontSize,
    }
  }

  return {
    lines: [input.text],
    fontSize: input.minFontSize,
  }
}

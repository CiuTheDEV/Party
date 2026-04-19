type CodenamesCardBackMarkProps = {
  rootClassName: string
  compactClassName?: string
  surfaceClassName: string
  gridClassName: string
  topMetaClassName: string
  bottomMetaClassName: string
  centerClassName: string
  badgeClassName: string
  emojiClassName: string
  labelClassName: string
  density?: 'default' | 'compact'
}

export function CodenamesCardBackMark({
  rootClassName,
  compactClassName,
  surfaceClassName,
  gridClassName,
  topMetaClassName,
  bottomMetaClassName,
  centerClassName,
  badgeClassName,
  emojiClassName,
  labelClassName,
  density = 'default',
}: CodenamesCardBackMarkProps) {
  const rootClasses =
    density === 'compact' && compactClassName
      ? `${rootClassName} ${compactClassName}`
      : rootClassName

  return (
    <span className={rootClasses}>
      <span className={surfaceClassName}>
        <span className={gridClassName} aria-hidden="true" />
        <span className={topMetaClassName}>SEKTOR 05</span>
        <span className={bottomMetaClassName}>OPERACJA TAJNIACY</span>
        <span className={centerClassName}>
          <span className={badgeClassName}>
            <span className={emojiClassName} aria-hidden="true">
              {'\u{1F575}\uFE0F'}
            </span>
          </span>
          <span className={labelClassName}>TAJNIACY</span>
        </span>
      </span>
    </span>
  )
}

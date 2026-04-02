import styles from './SegmentedChoice.module.css'

type SegmentedChoiceOption<T extends string> = {
  value: T
  label: string
}

type SegmentedChoiceProps<T extends string> = {
  options: SegmentedChoiceOption<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  ariaLabel: string
  className?: string
}

export function SegmentedChoice<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: SegmentedChoiceProps<T>) {
  return (
    <div
      className={[styles.root, disabled ? styles.rootDisabled : '', className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            className={[styles.option, isActive ? styles.optionActive : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export type { SegmentedChoiceOption }

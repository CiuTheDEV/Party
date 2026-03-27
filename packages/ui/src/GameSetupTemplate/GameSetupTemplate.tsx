import type { GameSetupTemplateProps } from '@party/game-sdk'
import styles from './GameSetupTemplate.module.css'

export function GameSetupTemplate<TState>({
  title,
  subtitle,
  sections,
  validation,
  onStart,
  onClose,
  startLabel = 'Start',
}: GameSetupTemplateProps<TState>) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Zamknij">
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {sections.map((section) => (
            section.unstyled ? (
              <div key={section.id} className={section.className}>
                {section.content}
              </div>
            ) : (
              <section key={section.id} className={section.className ? `${styles.section} ${section.className}` : styles.section}>
                {section.title ? <h3 className={styles.sectionTitle}>{section.title}</h3> : null}
                {section.description ? <p className={styles.sectionDescription}>{section.description}</p> : null}
                <div className={styles.sectionContent}>{section.content}</div>
              </section>
            )
          ))}
        </div>

        <div className={styles.footer}>
          {validation.errors && validation.errors.length > 0 ? (
            <ul className={styles.errorList}>
              {validation.errors.map((error) => (
                <li key={error} className={styles.errorItem}>
                  {error}
                </li>
              ))}
            </ul>
          ) : null}

          <button type="button" className={styles.primaryButton} onClick={onStart} disabled={!validation.canStart}>
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

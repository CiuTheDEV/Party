import { ChevronLeft } from 'lucide-react'
import type { MutableRefObject } from 'react'
import { AvatarAsset } from '../../avatars/AvatarAsset'
import { AutoscaledWord } from '../shared/AutoscaledWord'
import styles from './PlayBoard.module.css'
import { PresenterCard } from './PlayBoardCards'
import type { PlayerSummary, RankedPlayer } from './playboard-types'

type SharedPhaseProps = {
  presenter: PlayerSummary | undefined
}

type TimerRunningViewProps = SharedPhaseProps & {
  timerRemaining: number
}

type VerdictViewProps = SharedPhaseProps & {
  currentWord: string
  isVerdictWordVisible: boolean
  onToggleWordVisibility: () => void
}

type RoundSummaryViewProps = {
  currentRound: number
  totalRounds: number
  leaders: string[]
  topScore: number
  rankedPlayers: RankedPlayer[]
}

type PrepareViewProps = SharedPhaseProps & {
  showScoreRail: boolean
  isScoreRailExpanded: boolean
  displayedScoredPlayers: RankedPlayer[]
  scoreItemRefs: MutableRefObject<Record<string, HTMLDivElement | null>>
  onToggleScoreRail: () => void
  getScoreKey: (player: RankedPlayer) => string
}

type BufferViewProps = SharedPhaseProps & {
  bufferRemaining: number
}

function shouldAutoscaleWord(word: string) {
  const normalized = word.trim()
  const wordCount = normalized.split(/\s+/).filter(Boolean).length

  return normalized.length > 22 || wordCount > 2
}

export function TimerRunningView({ presenter, timerRemaining }: TimerRunningViewProps) {
  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.timerContent}>
            <span className={styles.eyebrow}>Prezentuj!</span>
            <div className={styles.timerHero}>
              <h1 className={styles.timerTitle}>Czas do końca prezentowania</h1>
              <div className={styles.timer}>{timerRemaining}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export function VerdictView({
  presenter,
  currentWord,
  isVerdictWordVisible,
  onToggleWordVisibility,
}: VerdictViewProps) {
  const useAutoscale = shouldAutoscaleWord(currentWord)

  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.verdictContent}>
            <span className={styles.eyebrow}>Werdykt</span>
            <div className={styles.verdictHero}>
              <h1 className={styles.verdictTitle}>Czy hasło zostało odgadnięte?</h1>
              {currentWord ? (
                <>
                  <button
                    type="button"
                    className={styles.verdictRevealButton}
                    onClick={onToggleWordVisibility}
                  >
                    {isVerdictWordVisible ? 'Ukryj hasło' : 'Pokaż hasło'}
                  </button>
                  <div className={styles.verdictWordSlot}>
                    {useAutoscale ? (
                      <AutoscaledWord
                        text={currentWord}
                        className={`${styles.verdictWordShell} ${styles.verdictWordScaleRoot}`}
                        textClassName={styles.verdictWord}
                        isVisible={isVerdictWordVisible}
                        minFontSize={14}
                        maxFontSize={54}
                      />
                    ) : (
                      <div
                        className={`${styles.verdictWordShell} ${styles.verdictWordStaticWrap}`}
                        data-visible={String(isVerdictWordVisible)}
                      >
                        <div className={`${styles.verdictWord} ${styles.verdictWordStatic}`}>{currentWord}</div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            <div className={styles.verdictNote}>
              <span className={styles.verdictNoteLabel}>Decyzja hosta</span>
              <p className={styles.verdictNoteText}>
                Wybierz w dolnym pasku, czy prezentowane hasło zostało odgadnięte.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export function RoundSummaryView({
  currentRound,
  totalRounds,
  leaders,
  topScore,
  rankedPlayers,
}: RoundSummaryViewProps) {
  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.summaryScreen}>
          <span className={styles.eyebrow}>Podsumowanie rundy</span>
          <div className={styles.summaryHero}>
            <h1 className={styles.summaryTitle}>
              Podsumowanie rundy {currentRound}/{totalRounds}
            </h1>
            <p className={styles.summaryLead}>
              {leaders.length > 0
                ? `Aktualni liderzy: ${leaders.join(', ')} (${topScore})`
                : 'Po tej rundzie nadal nie ma zdobytych punktów.'}
            </p>
          </div>

          <div className={styles.summaryRanking}>
            {rankedPlayers.map((player) => (
              <div key={player.name} className={styles.summaryRow} data-rank={player.rank}>
                <span className={styles.summaryRank}>#{player.rank}</span>
                <AvatarAsset avatar={player.avatar} className={styles.summaryAvatar} />
                <span className={styles.summaryName} data-gender={player.gender}>
                  {player.name}
                </span>
                <span className={styles.summaryScore}>{player.score ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export function PrepareView({
  presenter,
  showScoreRail,
  isScoreRailExpanded,
  displayedScoredPlayers,
  scoreItemRefs,
  onToggleScoreRail,
  getScoreKey,
}: PrepareViewProps) {
  return (
    <main className={`${styles.board} ${styles.boardPrepare}`}>
      <section className={`${styles.stage} ${styles.stagePrepare}`}>
        <div className={styles.prepareScene}>
          <div className={styles.prepareLayout}>
            <div className={styles.preparePlayerPane}>
              <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
            </div>

            <div className={styles.prepareContent}>
              <span className={styles.eyebrow}>Za chwilę start</span>
              <div className={styles.prepareHero}>
                <h1 className={styles.title}>Hasło czeka na urządzeniu prezentera</h1>
              </div>

              <div className={styles.stepList}>
                <div className={styles.stepItem}>
                  <span className={styles.stepIndex}>1</span>
                  <p>Po kliknięciu "Odkryj hasło" prezenter ma 10 sekund, by zapoznać się z hasłem.</p>
                </div>
                <div className={styles.stepItem}>
                  <span className={styles.stepIndex}>2</span>
                  <p>Po tym czasie uruchomi się główny licznik na prezentowanie hasła.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showScoreRail ? (
        <aside className={styles.scoreRail} data-expanded={isScoreRailExpanded}>
          <button
            type="button"
            className={styles.scoreRailToggle}
            data-expanded={isScoreRailExpanded}
            onClick={onToggleScoreRail}
            aria-label={isScoreRailExpanded ? 'Schowaj wynik' : 'Pokaż wynik'}
          >
            <span className={styles.scoreRailToggleIcon} aria-hidden="true">
              <ChevronLeft size={22} />
            </span>
          </button>

          <div className={styles.scoreRailHeader}>
            <span className={styles.scoreRailLabel}>Wynik</span>
          </div>
          <div className={styles.scoreRailList}>
            {displayedScoredPlayers.map((player) => {
              const key = getScoreKey(player)
              return (
                <div
                  key={key}
                  ref={(element) => {
                    scoreItemRefs.current[key] = element
                  }}
                  className={styles.scoreRailItem}
                  data-rank={displayedScoredPlayers[0]?.score === (player.score ?? 0) ? 'leader' : 'chasing'}
                >
                  <AvatarAsset avatar={player.avatar} className={styles.scoreRailAvatar} />
                  <span className={styles.scoreRailName} data-gender={player.gender}>
                    {player.name}
                  </span>
                  <span className={styles.scoreRailPoints}>{player.score ?? 0}</span>
                </div>
              )
            })}
          </div>
        </aside>
      ) : null}
    </main>
  )
}

export function BufferView({ presenter, bufferRemaining }: BufferViewProps) {
  return (
    <main className={styles.board}>
      <section className={styles.stage}>
        <div className={styles.prepareLayout}>
          <div className={styles.preparePlayerPane}>
            <PresenterCard presenter={presenter} subtitle="Prezenter" featured />
          </div>

          <div className={styles.bufferContent}>
            <span className={styles.eyebrow}>Zapamiętaj hasło</span>
            <div className={styles.bufferHero}>
              <h1 className={styles.bufferTitle}>Prezenter zapoznaje się z hasłem</h1>
              <div className={styles.bufferTimerWrap}>
                <div className={styles.timer}>{bufferRemaining}</div>
                <span className={styles.bufferTimerLabel}>sekund do startu tury</span>
              </div>
            </div>
            <div className={styles.bufferSideNote}>
              <span className={styles.bufferSideNoteLabel}>Na planszy</span>
              <p className={styles.bufferHint}>
                To jest moment tylko dla prezentera. Reszta graczy czeka na start tury.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

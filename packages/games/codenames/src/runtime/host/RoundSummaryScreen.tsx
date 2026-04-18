'use client'

import { AvatarAsset } from '@party/ui'
import styles from './RoundSummaryScreen.module.css'

type CodenamesTeam = { name: string; avatar: string }
type SummaryReason = 'assassin' | 'victory'

type RoundSummaryScreenProps = {
  reason: SummaryReason
  redTeam: CodenamesTeam
  blueTeam: CodenamesTeam
  winnerTeam: CodenamesTeam
  loserTeam: CodenamesTeam
  redRoundWins: number
  blueRoundWins: number
  roundsToWin: number
  onNextRound: () => void
}

export function RoundSummaryScreen({
  reason,
  redTeam,
  blueTeam,
  winnerTeam,
  loserTeam,
  redRoundWins,
  blueRoundWins,
  roundsToWin,
  onNextRound,
}: RoundSummaryScreenProps) {
  const bannerText =
    reason === 'assassin'
      ? `${loserTeam.name} trafili na zabójcę!`
      : `${winnerTeam.name} wygrali rundę!`

  const bannerAvatar = reason === 'assassin' ? loserTeam.avatar : winnerTeam.avatar

  return (
    <div className={styles.overlay}>
      <div className={styles.shell}>
        <div className={styles.banner}>
          <AvatarAsset avatar={bannerAvatar} size={40} />
          <span className={styles.bannerText}>{bannerText}</span>
        </div>

        <div className={styles.vsRow}>
          <div className={styles.teamSide}>
            <div className={styles.teamSideIcon} data-team="red">
              <AvatarAsset avatar={redTeam.avatar} size={48} />
            </div>
            <span className={styles.teamSideLabel}>{redTeam.name}</span>
          </div>

          <div className={styles.scoreCard} data-team="red">{redRoundWins}</div>
          <div className={styles.vs}>VS</div>
          <div className={styles.scoreCard} data-team="blue">{blueRoundWins}</div>

          <div className={styles.teamSide} data-side="right">
            <span className={styles.teamSideLabel}>{blueTeam.name}</span>
            <div className={styles.teamSideIcon} data-team="blue">
              <AvatarAsset avatar={blueTeam.avatar} size={48} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.hint}>Do {roundsToWin} wygranych rund</div>
          <button type="button" className={styles.nextRoundButton} onClick={onNextRound}>
            Kolejna runda
          </button>
        </div>
      </div>
    </div>
  )
}

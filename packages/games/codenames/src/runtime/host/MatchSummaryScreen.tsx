'use client'

import { AvatarAsset } from '@party/ui'
import styles from './MatchSummaryScreen.module.css'

type CodenamesTeam = { name: string; avatar: string }

type MatchSummaryScreenProps = {
  redTeam: CodenamesTeam
  blueTeam: CodenamesTeam
  winnerTeam: CodenamesTeam
  loserTeam: CodenamesTeam
  redRoundWins: number
  blueRoundWins: number
  roundsToWin: number
  onReplayMatch: () => void
  onExitToMenu: () => void
}

export function MatchSummaryScreen({
  redTeam,
  blueTeam,
  winnerTeam,
  loserTeam,
  redRoundWins,
  blueRoundWins,
  roundsToWin,
  onReplayMatch,
  onExitToMenu,
}: MatchSummaryScreenProps) {
  const bannerAvatar = winnerTeam.avatar
  const bannerText = `${winnerTeam.name} WYGRYWAJĄ MECZ!`
  const bannerAccent = winnerTeam === blueTeam ? 'blue' : 'red'

  return (
    <div className={styles.overlay}>
      <div className={styles.shell}>
        <div className={styles.banner} data-accent={bannerAccent}>
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

          <div className={styles.scoreCard} data-team="red">
            {redRoundWins}
          </div>
          <div className={styles.vs}>VS</div>
          <div className={styles.scoreCard} data-team="blue">
            {blueRoundWins}
          </div>

          <div className={styles.teamSide} data-side="right">
            <span className={styles.teamSideLabel}>{blueTeam.name}</span>
            <div className={styles.teamSideIcon} data-team="blue">
              <AvatarAsset avatar={blueTeam.avatar} size={48} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.hint}>Do {roundsToWin} wygranych rund</div>
          <div className={styles.footerActions}>
            <button type="button" className={styles.secondaryButton} onClick={onExitToMenu}>
              Powrót do menu
            </button>
            <button type="button" className={styles.nextRoundButton} onClick={onReplayMatch}>
              Zagraj ponownie
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

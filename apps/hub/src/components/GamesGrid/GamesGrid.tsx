import type { GameConfig } from '@party/game-sdk'
import { GameCard } from '@/components/GameCard/GameCard'
import styles from './GamesGrid.module.css'

type GamesGridProps = {
  games: GameConfig[]
}

export function GamesGrid({ games }: GamesGridProps) {
  return (
    <section className={styles.section}>
      <h1 className={styles.heading}>Wybierz grę</h1>
      {games.length === 0 ? (
        <p className={styles.empty}>Brak dostępnych gier.</p>
      ) : (
        <div className={styles.grid}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  )
}

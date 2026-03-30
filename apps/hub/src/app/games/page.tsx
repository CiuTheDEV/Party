'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Epilogue, Manrope } from 'next/font/google'
import { Search, SlidersHorizontal, Users } from 'lucide-react'
import { PremiumModal } from '@party/ui'
import { games } from '@/data/games'
import styles from './page.module.css'

const headingFont = Epilogue({ subsets: ['latin'], weight: ['700', '800', '900'] })
const bodyFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export default function GamesCatalogPage() {
  const [query, setQuery] = useState('')
  const [showPremium, setShowPremium] = useState(false)

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return games
    }

    return games.filter((game) => {
      const searchableParts = [
        game.name,
        game.description,
        game.status,
        game.modes.join(' '),
        game.categories.join(' '),
      ]

      return searchableParts.some((part) => part.toLowerCase().includes(normalizedQuery))
    })
  }, [query])

  return (
    <>
      <main className={`${styles.page} ${bodyFont.className}`}>
        <section className={styles.hero}>
          <Link href="/" className={styles.backLink}>
            Wróć do hubu
          </Link>
          <span className={styles.eyebrow}>Pełny katalog</span>
          <h1 className={`${styles.title} ${headingFont.className}`}>Biblioteka gier</h1>
          <p className={styles.lead}>
            Wszystkie gry Project Party w jednym miejscu. Teraz z prostym wyszukiwaniem,
            później z filtrami po kategoriach, liczbie graczy i statusie.
          </p>
        </section>

        <section className={styles.toolsSection}>
          <label className={styles.searchWrap}>
            <Search size={18} aria-hidden="true" />
            <input
              className={styles.searchInput}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj gry, trybu albo kategorii..."
              aria-label="Szukaj gier"
            />
          </label>

          <div className={styles.filterHint}>
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filtry pojawią się tutaj w kolejnym kroku
          </div>
        </section>

        {filteredGames.length > 0 ? (
          <section className={styles.grid}>
            {filteredGames.map((game) => {
              const content = (
                <>
                  <div className={styles.cardTop}>
                    <div className={styles.iconBadge} aria-hidden="true">
                      {game.icon}
                    </div>
                    <span
                      className={game.status === 'live' ? styles.statusLive : styles.statusSoon}
                    >
                      {game.status === 'live' ? 'Dostępna teraz' : 'Wkrótce'}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <h2 className={`${styles.cardTitle} ${headingFont.className}`}>{game.name}</h2>
                    <p className={styles.cardDescription}>{game.description}</p>
                  </div>

                  <div className={styles.cardMeta}>
                    <span className={styles.metaPill}>
                      <Users size={14} aria-hidden="true" />
                      {game.minPlayers}-{game.maxPlayers} graczy
                    </span>
                    {game.categories.length > 0 ? (
                      <span className={styles.metaPill}>{game.categories.join(' · ')}</span>
                    ) : (
                      <span className={styles.metaPill}>Kategorie wkrótce</span>
                    )}
                  </div>
                </>
              )

              if (game.status === 'live') {
                return (
                  <Link key={game.id} href={game.href} className={styles.cardLink}>
                    <article
                      className={styles.card}
                      style={{ '--game-gradient': game.gradient ?? game.color } as CSSProperties}
                    >
                      {content}
                    </article>
                  </Link>
                )
              }

              return (
                <button
                  key={game.id}
                  type="button"
                  className={styles.cardButton}
                  onClick={() => setShowPremium(true)}
                >
                  <article
                    className={styles.card}
                    style={{ '--game-gradient': game.gradient ?? game.color } as CSSProperties}
                  >
                    {content}
                  </article>
                </button>
              )
            })}
          </section>
        ) : (
          <section className={styles.emptyState}>
            <span className={styles.emptyEyebrow}>Brak wyników</span>
            <h2 className={`${styles.emptyTitle} ${headingFont.className}`}>
              Nic nie pasuje do tego wyszukiwania
            </h2>
            <p className={styles.emptyText}>
              Spróbuj innej nazwy gry, trybu albo kategorii.
            </p>
          </section>
        )}
      </main>

      {showPremium ? <PremiumModal onClose={() => setShowPremium(false)} /> : null}
    </>
  )
}

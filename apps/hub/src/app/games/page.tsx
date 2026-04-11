'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Epilogue, Manrope } from 'next/font/google'
import { ArrowRight, Clock3, LayoutGrid, Search, Users } from 'lucide-react'
import { PremiumModal } from '@party/ui'
import { games } from '@/data/games'
import styles from './page.module.css'

const headingFont = Epilogue({ subsets: ['latin'], weight: ['700', '800', '900'] })
const bodyFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

function formatMode(mode: string) {
  switch (mode) {
    case 'classic':
      return 'Klasyczny'
    case 'teams':
      return 'Drużyny'
    default:
      return mode
  }
}

function formatCategory(category: string) {
  switch (category) {
    case 'animals':
      return 'Zwierzęta'
    case 'movies':
      return 'Filmy'
    case 'sport':
      return 'Sport'
    default:
      return category
  }
}

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

  const liveGames = filteredGames.filter((game) => game.status === 'live')
  const comingSoonGames = filteredGames.filter((game) => game.status === 'coming-soon')
  const totalModes = games.reduce((count, game) => count + game.modes.length, 0)
  const trimmedQuery = query.trim()
  const resultSummary = trimmedQuery
    ? `${filteredGames.length} ${filteredGames.length === 1 ? 'wynik' : 'wyniki'} dla „${trimmedQuery}”`
    : `${games.length} pozycji w katalogu`

  return (
    <>
      <main className={`${styles.page} ${bodyFont.className}`}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />

          <Link href="/" className={styles.backLink}>
            Wróć do hubu
          </Link>

          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Pełny katalog</span>
            <h1 className={`${styles.title} ${headingFont.className}`}>Biblioteka gier</h1>
            <p className={styles.lead}>
              Przeglądaj wszystkie doświadczenia Project Party w jednym miejscu. Część jest gotowa
              na dzisiejszy wieczór, część dojrzewa jeszcze w laboratorium.
            </p>
          </div>

          <div className={styles.heroStats} aria-label="Podsumowanie katalogu">
            <article className={styles.statCard}>
              <span className={styles.statLabel}>Dostępne teraz</span>
              <strong className={`${styles.statValue} ${headingFont.className}`}>{liveGames.length}</strong>
              <p className={styles.statText}>Gotowe do wejścia prosto z katalogu.</p>
            </article>

            <article className={styles.statCard}>
              <span className={styles.statLabel}>Na radarze</span>
              <strong className={`${styles.statValue} ${headingFont.className}`}>{comingSoonGames.length}</strong>
              <p className={styles.statText}>Kolejne moduły już mają swoje miejsce w lineupie.</p>
            </article>

            <article className={styles.statCard}>
              <span className={styles.statLabel}>Tryby gry</span>
              <strong className={`${styles.statValue} ${headingFont.className}`}>{totalModes}</strong>
              <p className={styles.statText}>Od klasycznych rund po formaty drużynowe.</p>
            </article>
          </div>
        </section>

        <section className={styles.toolsSection}>
          <div className={styles.searchPanel}>
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
            <p className={styles.searchSummary}>{resultSummary}</p>
          </div>

          <aside className={styles.catalogNote}>
            <span className={styles.catalogNoteEyebrow}>Kuracja katalogu</span>
            <p className={styles.catalogNoteText}>
              Katalog pokazuje zarówno gry gotowe do uruchomienia, jak i te, które już budują
              napięcie przed premierą.
            </p>
          </aside>
        </section>

        {filteredGames.length > 0 ? (
          <div className={styles.catalogStack}>
            {liveGames.length > 0 ? (
              <section className={styles.catalogSection} aria-labelledby="games-live-heading">
                <div className={styles.sectionHeader}>
                  <div>
                    <span className={styles.sectionEyebrow}>Dostępne teraz</span>
                    <h2 id="games-live-heading" className={`${styles.sectionTitle} ${headingFont.className}`}>
                      Wejdź do lobby bez czekania
                    </h2>
                  </div>
                  <p className={styles.sectionLead}>
                    Te gry są już gotowe na wspólną sesję i prowadzą prosto do własnego modułu.
                  </p>
                </div>

                <div className={styles.grid}>
                  {liveGames.map((game) => {
                    const modes = game.modes.map(formatMode)
                    const categories = game.categories.map(formatCategory)

                    return (
                      <Link key={game.id} href={game.href} className={styles.cardLink}>
                        <article
                          className={styles.card}
                          style={{ '--game-gradient': game.gradient ?? game.color } as CSSProperties}
                        >
                          <div className={styles.cardBackdrop} aria-hidden="true" />

                          <div className={styles.cardTop}>
                            <div className={styles.iconBadge} aria-hidden="true">
                              {game.icon}
                            </div>
                            <span className={styles.statusLive}>Dostępna teraz</span>
                          </div>

                          <div className={styles.cardBody}>
                            <h3 className={`${styles.cardTitle} ${headingFont.className}`}>{game.name}</h3>
                            <p className={styles.cardDescription}>{game.description}</p>
                          </div>

                          <div className={styles.cardMeta}>
                            <span className={styles.metaPill}>
                              <Users size={14} aria-hidden="true" />
                              {game.minPlayers}-{game.maxPlayers} graczy
                            </span>
                            {modes.map((mode: string) => (
                              <span key={mode} className={styles.metaPill}>
                                {mode}
                              </span>
                            ))}
                            {categories.length > 0 ? (
                              <span className={styles.metaPill}>{categories.join(' · ')}</span>
                            ) : null}
                          </div>

                          <div className={styles.cardFooter}>
                            <span className={styles.cardActionLabel}>Wejdź do gry</span>
                            <ArrowRight size={18} aria-hidden="true" />
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ) : null}

            {comingSoonGames.length > 0 ? (
              <section className={styles.catalogSection} aria-labelledby="games-soon-heading">
                <div className={styles.sectionHeader}>
                  <div>
                    <span className={styles.sectionEyebrow}>W przygotowaniu</span>
                    <h2 id="games-soon-heading" className={`${styles.sectionTitle} ${headingFont.className}`}>
                      Następne pozycje w kolekcji
                    </h2>
                  </div>
                  <p className={styles.sectionLead}>
                    Te moduły są już wpisane do biblioteki, ale czekają jeszcze na pełny runtime i
                    wejście na scenę.
                  </p>
                </div>

                <div className={styles.grid}>
                  {comingSoonGames.map((game) => {
                    const modes = game.modes.map(formatMode)

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
                          <div className={styles.cardBackdrop} aria-hidden="true" />

                          <div className={styles.cardTop}>
                            <div className={styles.iconBadge} aria-hidden="true">
                              {game.icon}
                            </div>
                            <span className={styles.statusSoon}>Wkrótce</span>
                          </div>

                          <div className={styles.cardBody}>
                            <h3 className={`${styles.cardTitle} ${headingFont.className}`}>{game.name}</h3>
                            <p className={styles.cardDescription}>{game.description}</p>
                          </div>

                          <div className={styles.cardMeta}>
                            <span className={styles.metaPill}>
                              <Clock3 size={14} aria-hidden="true" />
                              Premiera w przygotowaniu
                            </span>
                            {modes.map((mode: string) => (
                              <span key={mode} className={styles.metaPill}>
                                {mode}
                              </span>
                            ))}
                          </div>

                          <div className={styles.cardFooter}>
                            <span className={styles.cardActionLabel}>Zobacz zapowiedź</span>
                            <ArrowRight size={18} aria-hidden="true" />
                          </div>
                        </article>
                      </button>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <LayoutGrid size={22} />
            </div>
            <span className={styles.emptyEyebrow}>Brak wyników</span>
            <h2 className={`${styles.emptyTitle} ${headingFont.className}`}>
              Nic nie pasuje do tego wyszukiwania
            </h2>
            <p className={styles.emptyText}>
              Spróbuj innej nazwy gry, trybu albo kategorii. Katalog jest jeszcze mały, więc nawet
              drobna zmiana frazy potrafi od razu odsłonić właściwy moduł.
            </p>
          </section>
        )}
      </main>

      {showPremium ? <PremiumModal onClose={() => setShowPremium(false)} /> : null}
    </>
  )
}

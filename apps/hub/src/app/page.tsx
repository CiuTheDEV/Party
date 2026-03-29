'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Epilogue, Manrope } from 'next/font/google'
import {
  Globe,
  Mail,
  ChevronLeft,
  ChevronRight,
  Search,
  Share2,
} from 'lucide-react'
import { PremiumModal } from '@party/ui'
import { games, liveGames } from '@/data/games'
import { HeroCarousel } from '@/features/hub/components/HeroCarousel'
import { SectionLink } from '@/features/hub/components/SectionLink'
import { libraryCards, railItems } from '@/features/hub/content/hub-content'
import { useActiveSection } from '@/features/hub/hooks/useActiveSection'
import layoutStyles from '@/features/hub/styles/layout.module.css'
import sectionStyles from '@/features/hub/styles/sections.module.css'

const headingFont = Epilogue({ subsets: ['latin'], weight: ['700', '800', '900'] })
const bodyFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

const libraryCardToneClassNames = {
  mystery: sectionStyles.cardMystery,
  seconds: sectionStyles.cardSeconds,
  mafia: sectionStyles.cardMafia,
  ships: sectionStyles.cardShips,
} as const

const railSectionHrefs = railItems.map((item) => item.href)

export default function HomePage() {
  const { activeHref: activeRailHref, setActiveHref: setActiveRailHref } = useActiveSection(railSectionHrefs)
  const [showPremium, setShowPremium] = useState(false)
  const featuredGame = liveGames[0]
  const gamesById = new Map(games.map((game) => [game.id, game]))

  return (
    <>
      <a href="#main-content" className={layoutStyles.skipLink}>
        Przejdz do tresci
      </a>

      <div className={`${layoutStyles.shell} ${bodyFont.className}`}>
        <header className={layoutStyles.topbar}>
          <div className={layoutStyles.topbarInner}>
            <span className={`${layoutStyles.topbarBrand} ${headingFont.className}`}>PROJECT PARTY</span>
            <button className={layoutStyles.loginButton} type="button">
              Zaloguj
            </button>
          </div>
        </header>

        <aside className={layoutStyles.rail} aria-label="Nawigacja Hubu">
          <div className={layoutStyles.railInner}>
            {railItems.filter((item) => !item.pinnedBottom).map((item) => {
              const Icon = item.icon
              return (
                <SectionLink
                  key={item.label}
                  href={item.href}
                  className={item.href === activeRailHref ? layoutStyles.railLinkActive : layoutStyles.railLink}
                  onNavigate={() => setActiveRailHref(item.href)}
                >
                  <span className={layoutStyles.iconWrap} aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className={layoutStyles.railLabel}>{item.label}</span>
                </SectionLink>
              )
            })}

            <div className={layoutStyles.railSpacer} />

            {railItems.filter((item) => item.pinnedBottom).map((item) => {
              const Icon = item.icon
              return (
                <SectionLink
                  key={item.label}
                  href={item.href}
                  className={item.href === activeRailHref ? layoutStyles.railLinkActive : layoutStyles.railLink}
                  onNavigate={() => setActiveRailHref(item.href)}
                >
                  <span className={layoutStyles.iconWrap} aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className={layoutStyles.railLabel}>{item.label}</span>
                </SectionLink>
              )
            })}
          </div>
        </aside>

        <main id="main-content" className={layoutStyles.main}>
          <HeroCarousel
            featuredHref={featuredGame?.href}
            featuredName={featuredGame?.name}
            headingFontClassName={headingFont.className}
          />

          <section id="library" className={sectionStyles.librarySection}>
            <div className={sectionStyles.libraryHeader}>
              <div>
                <h2 className={`${sectionStyles.libraryTitle} ${headingFont.className}`}>
                  Eteryczna Biblioteka
                </h2>
                <p className={sectionStyles.libraryLead}>Wybierz doswiadczenie</p>
              </div>

              <div className={sectionStyles.libraryTools}>
                <label className={sectionStyles.searchWrap}>
                  <Search size={16} aria-hidden="true" />
                  <input className={sectionStyles.searchInput} type="search" placeholder="Szukaj gier..." />
                </label>
                <button className={sectionStyles.toolCircle} type="button" aria-label="Poprzednia karta">
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button className={sectionStyles.toolCircle} type="button" aria-label="Nastepna karta">
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={sectionStyles.libraryGrid}>
              {libraryCards.map((card, index) => {
                const linkedGame = card.gameId ? gamesById.get(card.gameId) : undefined
                const isFeaturedCard = index === 0 && featuredGame
                const isPlayable = linkedGame?.status === 'live' || isFeaturedCard
                const href = linkedGame?.status === 'live' ? linkedGame.href : featuredGame?.href
                const cardBody = (
                  <div className={`${sectionStyles.cardVisual} ${libraryCardToneClassNames[card.tone]}`}>
                    <div className={sectionStyles.cardFade} />
                    <div className={sectionStyles.cardCaption}>
                      <span className={sectionStyles.cardTag}>{card.label}</span>
                      <h3 className={`${sectionStyles.cardTitle} ${headingFont.className}`}>{card.name}</h3>
                    </div>
                  </div>
                )

                if (isPlayable && href) {
                  return (
                    <Link key={card.name} href={href} className={sectionStyles.cardShell}>
                      {cardBody}
                    </Link>
                  )
                }

                return (
                  <button
                    key={card.name}
                    className={sectionStyles.cardShell}
                    type="button"
                    onClick={() => setShowPremium(true)}
                  >
                    {cardBody}
                  </button>
                )
              })}
            </div>
          </section>

          <section id="showcase" className={sectionStyles.showcaseSection}>
            <div className={sectionStyles.showcaseVisual}>
              <div className={sectionStyles.showcaseGlow} />
              <div className={sectionStyles.showcasePanel}>
                <div className={sectionStyles.showcaseBust} />
              </div>
            </div>

            <div className={sectionStyles.showcaseCopy}>
              <span className={sectionStyles.showcaseEyebrow}>Zaprojektowane dla bliskosci</span>
              <h2 className={`${sectionStyles.showcaseTitle} ${headingFont.className}`}>
                Sztuka spolecznej
                <br />
                pustki.
              </h2>
              <p className={sectionStyles.showcaseText}>
                Bez rozpraszaczy. Bez balaganu. Tylko Ty, Twoi znajomi i gry, ktore definiuja noc.
                Project Party to plotno dla Waszych wspolnych doswiadczen.
              </p>
              <button className={sectionStyles.ghostButton} type="button">
                Poznaj wizje
              </button>
            </div>
          </section>

          <footer id="footer" className={sectionStyles.footer}>
            <div className={sectionStyles.footerTop}>
              <div className={sectionStyles.footerBrandBlock}>
                <span className={`${sectionStyles.footerBrand} ${headingFont.className}`}>PROJECT PARTY</span>
                <p className={sectionStyles.footerText}>
                  Nowoczesne centrum gier towarzyskich zbudowane dla cyfrowej estetyki. Minimalistyczne z
                  zalozenia, wciagajace z natury.
                </p>
              </div>

              <div className={sectionStyles.footerLinks}>
                <div className={sectionStyles.footerColumn}>
                  <span className={sectionStyles.footerColumnTitle}>Platforma</span>
                  <SectionLink href="#library">Gry</SectionLink>
                  <SectionLink href="#hero">Lobby</SectionLink>
                  <SectionLink href="#showcase">Profile</SectionLink>
                </div>

                <div className={sectionStyles.footerColumn}>
                  <span className={sectionStyles.footerColumnTitle}>Firma</span>
                  <SectionLink href="#footer">Prywatnosc</SectionLink>
                  <SectionLink href="#footer">Regulamin</SectionLink>
                  <SectionLink href="#footer">Kontakt</SectionLink>
                </div>
              </div>
            </div>

            <div className={sectionStyles.footerBottom}>
              <p className={sectionStyles.footerMeta}>© 2024 Project Party. Wszelkie prawa zastrzezone.</p>
              <div className={sectionStyles.footerIcons}>
                <SectionLink href="#footer" ariaLabel="Strona publiczna">
                  <Globe size={16} aria-hidden="true" />
                </SectionLink>
                <SectionLink href="#footer" ariaLabel="Email">
                  <Mail size={16} aria-hidden="true" />
                </SectionLink>
                <SectionLink href="#footer" ariaLabel="Udostepnij">
                  <Share2 size={16} aria-hidden="true" />
                </SectionLink>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </>
  )
}

'use client'

import type { CSSProperties } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Globe, Mail, Share2 } from 'lucide-react'
import { GameShell, PremiumModal } from '@party/ui'
import { AuthButton } from '@/features/hub/components/AuthButton'
import type { NavLink } from '@party/ui'
import { games, liveGames } from '@/data/games'
import { HeroCarousel } from '@/features/hub/components/HeroCarousel'
import { SectionLink } from '@/features/hub/components/SectionLink'
import { featuredLibraryCards, railItems } from '@/features/hub/content/hub-content'
import { useActiveSection } from '@/features/hub/hooks/useActiveSection'
import { resolveLibraryCardMedia } from '@/features/hub/lib/library-card-media'
import { scrollToSection } from '@/features/hub/lib/scrolling'
import layoutStyles from '@/features/hub/styles/layout.module.css'
import sectionStyles from '@/features/hub/styles/sections.module.css'

const headingFont = { className: '' }
const bodyFont = { className: '' }

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
  const hubLinks: NavLink[] = railItems.map((item) => ({
    label: item.label,
    href: item.href,
    icon: <item.icon size={18} />,
    pinnedBottom: item.pinnedBottom,
    onSelect: item.href.startsWith('#') ? () => scrollToSection(item.href) : undefined,
  }))

  return (
    <>
      <a href="#main-content" className={layoutStyles.skipLink}>
        Przejdź do treści
      </a>

      <GameShell
        activeHref={activeRailHref}
        brandLabel="PROJECT PARTY"
        links={hubLinks}
        mainId="main-content"
        navAriaLabel="Nawigacja Hubu"
        onNavigate={setActiveRailHref}
        rootClassName={bodyFont.className}
        userSlot={<AuthButton />}
      >
        <HeroCarousel
          featuredHref={featuredGame?.href}
          featuredName={featuredGame?.name}
          headingFontClassName={headingFont.className}
        />

        <section id="library" className={sectionStyles.librarySection}>
          <div className={sectionStyles.libraryHeader}>
            <div>
              <h2 className={`${sectionStyles.libraryTitle} ${headingFont.className}`}>Eteryczna Biblioteka</h2>
              <p className={sectionStyles.libraryLead}>Wybierz doświadczenie</p>
            </div>
          </div>

          <div className={sectionStyles.libraryGrid}>
            {featuredLibraryCards.map((card) => {
              const linkedGame = card.gameId ? gamesById.get(card.gameId) : undefined
              const isPlayable = linkedGame?.status === 'live'
              const href = linkedGame?.status === 'live' ? linkedGame.href : undefined
              const cardMedia = resolveLibraryCardMedia(card)
              const cardVisualStyle = cardMedia?.kind === 'image'
                ? ({ '--card-image': `url('${cardMedia.src}')` } as CSSProperties)
                : undefined
              const cardBody = (
                <div
                  className={`${sectionStyles.cardVisual} ${libraryCardToneClassNames[card.tone]}`}
                  style={cardVisualStyle}
                >
                  {cardMedia?.kind === 'video' ? (
                    <video
                      className={sectionStyles.cardVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      poster={cardMedia.poster}
                      aria-hidden="true"
                    >
                      <source src={cardMedia.src} type="video/mp4" />
                    </video>
                  ) : null}
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

          <div className={sectionStyles.libraryCtaRow}>
            <Link href="/games" className={sectionStyles.libraryCta}>
              Pokaż wszystkie gry
            </Link>
          </div>
        </section>

        <footer id="footer" className={sectionStyles.footer}>
          <div className={sectionStyles.footerTop}>
            <div className={sectionStyles.footerBrandBlock}>
              <span className={`${sectionStyles.footerBrand} ${headingFont.className}`}>PROJECT PARTY</span>
              <p className={sectionStyles.footerText}>
                Hub gier towarzyskich na wspólne wieczory. Wchodzicie, wybieracie tytuł i od razu gracie.
              </p>
            </div>

            <div className={sectionStyles.footerLinks}>
              <div className={sectionStyles.footerColumn}>
                <span className={sectionStyles.footerColumnTitle}>Platforma</span>
                <SectionLink href="#library">Gry</SectionLink>
                <SectionLink href="#hero">Lobby</SectionLink>
              </div>

              <div className={sectionStyles.footerColumn}>
                <span className={sectionStyles.footerColumnTitle}>Firma</span>
                <SectionLink href="#footer">Prywatność</SectionLink>
                <SectionLink href="#footer">Regulamin</SectionLink>
                <SectionLink href="#footer">Kontakt</SectionLink>
              </div>
            </div>
          </div>

          <div className={sectionStyles.footerBottom}>
            <p className={sectionStyles.footerMeta}>© 2026 Project Party. Wszelkie prawa zastrzeżone.</p>
            <div className={sectionStyles.footerIcons}>
              <SectionLink href="#footer" ariaLabel="Strona publiczna">
                <Globe size={16} aria-hidden="true" />
              </SectionLink>
              <SectionLink href="#footer" ariaLabel="Email">
                <Mail size={16} aria-hidden="true" />
              </SectionLink>
              <SectionLink href="#footer" ariaLabel="Udostępnij">
                <Share2 size={16} aria-hidden="true" />
              </SectionLink>
            </div>
          </div>
        </footer>
      </GameShell>

      {showPremium ? <PremiumModal onClose={() => setShowPremium(false)} /> : null}
    </>
  )
}

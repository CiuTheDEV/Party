'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { heroSlides } from '../hero-slides'
import heroStyles from '../page-hero.module.css'
import { SectionLink } from './SectionLink'

type HeroCarouselProps = {
  featuredHref?: string
  featuredName?: string
  headingFontClassName: string
}

const heroToneClassNames = {
  charades: heroStyles.toneCharades,
  rotation: heroStyles.toneRotation,
  showcase: heroStyles.toneShowcase,
} as const

export function HeroCarousel({ featuredHref, featuredName, headingFontClassName }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const slides = heroSlides.map((slide, index) =>
    index === 0
      ? {
          ...slide,
          title: featuredName ?? slide.title,
          href: featuredHref ?? slide.href,
        }
      : slide,
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(intervalId)
  }, [slides.length])

  const showPreviousSlide = () => {
    setActiveSlide((currentSlide) => (currentSlide - 1 + slides.length) % slides.length)
  }

  const showNextSlide = () => {
    setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length)
  }

  return (
    <section id="hero" className={heroStyles.heroSection}>
      <div className={heroStyles.heroFrame}>
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`${heroStyles.heroSlide} ${
              index === activeSlide ? heroStyles.heroSlideActive : heroStyles.heroSlideInactive
            }`}
            aria-hidden={index === activeSlide ? undefined : 'true'}
          >
            <div className={heroStyles.heroOverlay}>
              <span className={heroStyles.heroEyebrow}>{slide.eyebrow}</span>
              <h1 className={`${heroStyles.heroTitle} ${headingFontClassName}`}>{slide.title}</h1>
              <p className={heroStyles.heroText}>{slide.description}</p>
              <SectionLink href={slide.href} className={heroStyles.playNow}>
                {slide.ctaLabel}
              </SectionLink>
            </div>

            <div className={`${heroStyles.heroBackdrop} ${heroToneClassNames[slide.tone]}`} aria-hidden="true">
              <div className={heroStyles.heroImagePlane} />
              <div className={heroStyles.heroRidgeOne} />
              <div className={heroStyles.heroRidgeTwo} />
              <div className={heroStyles.heroRidgeThree} />
              <div className={heroStyles.heroGlowPrimary} />
              <div className={heroStyles.heroGlowSecondary} />
              <div className={heroStyles.heroMesh} />
            </div>
          </div>
        ))}

        <div className={heroStyles.heroFooterControls}>
          <div className={heroStyles.heroDots} aria-label="Wybor planszy">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                className={index === activeSlide ? heroStyles.heroDotActive : heroStyles.heroDot}
                type="button"
                aria-label={`Pokaz plansze ${index + 1}`}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>

          <div className={heroStyles.heroArrows}>
            <button
              className={heroStyles.circleAction}
              type="button"
              aria-label="Poprzedni slajd"
              onClick={showPreviousSlide}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              className={heroStyles.circleAction}
              type="button"
              aria-label="Nastepny slajd"
              onClick={showNextSlide}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

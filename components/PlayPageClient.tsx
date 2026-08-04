'use client'

import { useEffect, useRef } from 'react'
import { GsapReveal } from '@/components/GsapReveal'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { PlayCard } from '@/components/PlayCard'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { getCaseStudyPreviewImages, mergePreviewImages } from '@/lib/preview-images'
import type { SiteContent } from '@/lib/site-content-schema'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function PlayPageClient({
  content,
}: {
  content: SiteContent
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()

  const games = content.caseStudies.filter((item) => item.section === 'play' && !item.hidden)
  const copy = content.copy.playPage

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const grid = gridRef.current
    if (!grid) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ctx = gsap.context(() => {
        gsap.set(grid.querySelectorAll('.portfolio-card'), { opacity: 1, scale: 1 })
      }, grid)
      return () => ctx.revert()
    }

    const ctx = gsap.context(() => {
      const cards = grid.querySelectorAll('.portfolio-card')
      gsap.set(cards, { opacity: 0, scale: motion.gridStartScale })

      const animateCards = () => {
        gsap.to(cards, {
          opacity: 1,
          scale: 1,
          duration: motion.gridRevealDuration,
          ease: 'power2.out',
          stagger: motion.gridRevealStagger,
        })
      }

      const gridAlreadyVisible = grid.getBoundingClientRect().top <= window.innerHeight * 0.85

      if (gridAlreadyVisible) {
        gsap.delayedCall(0.18, animateCards)
        return
      }

      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        onEnter: animateCards,
        once: true,
      })
    }, grid)

    return () => ctx.revert()
  }, [motion.gridRevealDuration, motion.gridRevealStagger, motion.gridStartScale])

  return (
    <>
      <Nav />

      <main style={{ paddingTop: '57px' }}>
        <section
          className="creative-hero-section border-b border-divider"
          style={{
            padding: '48px var(--layout-page-gutter) 56px',
          }}
        >
          <div
            className="eyebrow-animate flex items-center"
            style={{
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <div
              className="eyebrow-line"
              style={{
                width: '32px',
                height: '1px',
                backgroundColor: 'var(--color-red)',
              }}
            />
            <span
              className="eyebrow-label font-mono"
              style={{
                fontSize: 'var(--text-eyebrow)',
                letterSpacing: '0.18em',
                color: 'var(--color-red)',
              }}
            >
              {copy.eyebrow}
            </span>
          </div>

          <GsapReveal>
            <h1
              data-reveal
              className="font-serif"
              style={{
                fontSize: 'var(--text-h1)',
                fontWeight: 'var(--font-weight-serif)',
                color: 'var(--color-heading)',
                lineHeight: 1.05,
                marginBottom: '20px',
              }}
            >
              {copy.heroTitle}
            </h1>

            <p
              data-reveal
              className="font-mono"
              style={{
                fontSize: 'var(--text-body-lg)',
                letterSpacing: '0.04em',
                color: 'var(--color-body)',
                lineHeight: 1.9,
                maxWidth: '480px',
                margin: 0,
              }}
            >
              {copy.heroBody}
            </p>
          </GsapReveal>
        </section>

        <section
          className="work-grid-section"
          style={{ padding: '32px var(--layout-page-gutter) 56px' }}
        >
          <div
            ref={gridRef}
            className="grid play-card-grid"
            style={{
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '16px',
              rowGap: '16px',
              width: '100%',
              margin: 0,
            }}
          >
            {games.map((game, index) => {
              const images = mergePreviewImages(game.heroImage, getCaseStudyPreviewImages(game))

              return (
                <PlayCard
                  key={game.slug}
                  title={game.title}
                  oneliner={game.oneliner}
                  type={game.type}
                  href={`/play/${game.slug}`}
                  images={images}
                  ctaLabel={copy.cardCtaLabel}
                  hoverPreviewSettings={content.design.hoverPreviews}
                  priorityImage={index < 2}
                />
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

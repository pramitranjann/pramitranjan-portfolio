'use client'

import { useEffect, useRef } from 'react'
import { Footer } from '@/components/Footer'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { Nav } from '@/components/Nav'
import { PageHero } from '@/components/PageHero'
import { CreativeListingCard } from '@/components/CreativeListingCard'
import { PlayCard } from '@/components/PlayCard'
import type { CaseStudyContent, HoverPreviewSettings, PhotographyCardStyleSettings, PhotographyCity } from '@/lib/site-content-schema'
import { getCaseStudyPreviewImages, mergePreviewImages } from '@/lib/preview-images'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type PlayItem =
  | { key: string; medium: 'game'; game: CaseStudyContent }
  | { key: string; medium: 'photo'; city: PhotographyCity }
  | { key: string; medium: 'mixed'; project: CaseStudyContent }

/* A curated order rather than an algorithm — every row is meant to carry more than one
   medium. Anything the recipe does not name is appended, so new content still shows up. */
function buildWall({ games, cities, mixedMediaProjects }: { games: CaseStudyContent[]; cities: PhotographyCity[]; mixedMediaProjects: CaseStudyContent[] }) {
  const g = games.map<PlayItem>((game) => ({ key: `game-${game.slug}`, medium: 'game', game }))
  const p = cities.map<PlayItem>((city) => ({ key: `photo-${city.slug}`, medium: 'photo', city }))
  const m = mixedMediaProjects.map<PlayItem>((project) => ({ key: `mixed-${project.slug}`, medium: 'mixed', project }))

  const seq: PlayItem[] = []
  for (const item of [g[0], p[0], m[0], p[1], g[1], p[2], m[1], p[3]]) {
    if (item) seq.push(item)
  }
  const used = new Set(seq.map((item) => item.key))
  for (const item of [...g, ...p, ...m]) {
    if (!used.has(item.key)) seq.push(item)
  }
  return seq
}

export function PlayPageClient({
  games,
  cities,
  mixedMediaProjects,
  cardStyle,
  hoverPreviewSettings,
}: {
  games: CaseStudyContent[]
  cities: PhotographyCity[]
  mixedMediaProjects: CaseStudyContent[]
  cardStyle: PhotographyCardStyleSettings
  hoverPreviewSettings: HoverPreviewSettings
}) {
  const wallRef = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()
  const copy = useSiteCopy().creativePage
  const gameCtaLabel = useSiteCopy().playPage.cardCtaLabel

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const grids = [wallRef.current].filter((grid): grid is HTMLDivElement => grid !== null)

    if (reduced) {
      const contexts = grids.map((grid) => gsap.context(() => {
        gsap.set(grid.querySelectorAll('.portfolio-card'), { opacity: 1, scale: 1 })
      }, grid))
      return () => contexts.forEach((context) => context.revert())
    }

    const contexts = grids.map((grid) => gsap.context(() => {
      const cards = grid.querySelectorAll('.portfolio-card')
      gsap.set(cards, { opacity: 0, scale: motion.gridStartScale })
      const animateCards = () => {
        gsap.to(cards, { opacity: 1, scale: 1, duration: motion.gridRevealDuration, ease: 'power2.out', stagger: motion.gridRevealStagger })
      }

      // The first grid is usually already in view on load, so ScrollTrigger never fires for it.
      if (grid.getBoundingClientRect().top <= window.innerHeight * 0.85) {
        gsap.delayedCall(0.18, animateCards)
        return
      }

      ScrollTrigger.create({ trigger: grid, start: 'top 85%', onEnter: animateCards, once: true })
    }, grid))

    return () => contexts.forEach((context) => context.revert())
  }, [motion.gridRevealDuration, motion.gridRevealStagger, motion.gridStartScale])

  const wall = buildWall({ games, cities, mixedMediaProjects })

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <PageHero eyebrow={copy.eyebrow} title={copy.heroTitle} body={copy.heroBody} sectionClassName="creative-hero-section" variant="compact" />

        {/* One wall, no chapters. Medium is carried by each card's own meta line. */}
        <div ref={wallRef} className="play-wall">
          {wall.map((item, index) => (
            <div key={item.key} className="play-wall-item" data-medium={item.medium}>
              {item.medium === 'game' ? (
                <PlayCard
                  title={item.game.title}
                  oneliner={item.game.oneliner}
                  type={item.game.type}
                  href={`/play/${item.game.slug}`}
                  images={mergePreviewImages(item.game.heroImage, getCaseStudyPreviewImages(item.game))}
                  ctaLabel={gameCtaLabel}
                  hoverPreviewSettings={hoverPreviewSettings}
                  priorityImage={index < 4}
                />
              ) : item.medium === 'photo' ? (
                <CreativeListingCard
                  title={item.city.title}
                  desc={item.city.desc}
                  tag={item.city.type}
                  href={item.city.comingSoon ? undefined : `/play/photography/${item.city.slug}`}
                  cover={item.city.cover}
                  previewImages={item.city.previewImages}
                  comingSoon={item.city.comingSoon}
                  imagePosition={item.city.imagePosition ?? 'center'}
                  imageScale={item.city.imageScale}
                  hoverImagePosition={item.city.hoverImagePosition}
                  hoverImageScale={item.city.hoverImageScale}
                  cardStyle={cardStyle}
                  hoverPreviewSettings={hoverPreviewSettings}
                  priorityImage={index < 4}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                />
              ) : (
                <CreativeListingCard
                  title={item.project.title}
                  desc={item.project.oneliner}
                  tag={item.project.type}
                  href={`/play/mixed-media/${item.project.slug}`}
                  cover={item.project.heroImage}
                  previewImages={getCaseStudyPreviewImages(item.project)}
                  comingSoon={!item.project.heroImage}
                  imagePosition={item.project.cardImagePosition ?? 'center'}
                  imageScale={item.project.cardImageScale}
                  hoverImagePosition={item.project.cardHoverImagePosition}
                  hoverImageScale={item.project.cardHoverImageScale}
                  cardStyle={cardStyle}
                  hoverPreviewSettings={hoverPreviewSettings}
                  priorityImage={index < 4}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                />
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}

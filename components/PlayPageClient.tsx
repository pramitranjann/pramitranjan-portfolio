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
import { buildPlayWall } from '@/lib/play-wall'
import { getCaseStudyPreviewImages, mergePreviewImages } from '@/lib/preview-images'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* Ambient image rotation is opt-in per card, not a property of the wall. bowl and sling
   now render a looping clip instead (cardVideo), which bypasses the image rotation
   entirely — they stay listed so removing their clip restores rotation rather than a still. */
const AMBIENT_SLUGS = new Set(['bowl', 'sling', 'south-china-sea', 'hcmc'])

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
  const playCopy = useSiteCopy().playPage
  const gameCtaLabel = playCopy.cardCtaLabel

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

  const wall = buildPlayWall({ games, cities, mixedMediaProjects }, playCopy.cardOrder)

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
                  cardVideo={item.game.cardVideo}
                  hoverPreviewSettings={hoverPreviewSettings}
                  ambientIndex={AMBIENT_SLUGS.has(item.game.slug) ? index : undefined}
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
                  ambientIndex={AMBIENT_SLUGS.has(item.city.slug) ? index : undefined}
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
                  ambientIndex={AMBIENT_SLUGS.has(item.project.slug) ? index : undefined}
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

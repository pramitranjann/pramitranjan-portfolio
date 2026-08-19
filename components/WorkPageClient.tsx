'use client'

import { useEffect, useRef } from 'react'
import { Footer } from '@/components/Footer'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { Nav } from '@/components/Nav'
import { PageHero } from '@/components/PageHero'
import { ProjectCard } from '@/components/ProjectCard'
import type { CardStyleSettings, HoverPreviewSettings, WorkProject } from '@/lib/site-content-schema'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function WorkPageClient({
  heroTitle,
  heroBody,
  projects,
  cardStyle,
  hoverPreviewSettings,
}: {
  heroTitle: string
  heroBody: string
  projects: WorkProject[]
  cardStyle: CardStyleSettings
  hoverPreviewSettings: HoverPreviewSettings
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()
  const copy = useSiteCopy().workPage

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
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            scale: 1,
            duration: motion.gridRevealDuration,
            ease: 'power2.out',
            stagger: motion.gridRevealStagger,
          })
        },
        once: true,
      })
    }, grid)
    return () => ctx.revert()
  }, [motion.gridRevealDuration, motion.gridRevealStagger, motion.gridStartScale])

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <PageHero eyebrow={copy.eyebrow} title={heroTitle} body={heroBody} sectionClassName="work-hero-section" variant="compact" />

        <section className="work-grid-section work-grid-phone-contain" style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)' }}>
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--layout-card-gap)' }}>
            {projects.map((project, index) => (
              <ProjectCard
                key={`${project.href}-${project.title}`}
                {...project}
                variant="supporting"
                imageRatio={cardStyle.imageRatio}
                titleSize={cardStyle.titleSize}
                metaSize={cardStyle.metaSize}
                cardPadding={cardStyle.cardPadding}
                imageFit={cardStyle.imageFit}
                imageBackground={cardStyle.imageBackground}
                imageBorderColor={cardStyle.imageBorderColor}
                imageBorderWidth={cardStyle.imageBorderWidth}
                hoverPreviewSettings={hoverPreviewSettings}
                priorityImage={index < 4}
              />
            ))}
            <div className="flex items-center justify-center" style={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', padding: '16px', minHeight: '160px' }}>
              <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#444444', textAlign: 'center' }}>{copy.emptyStateLabel}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

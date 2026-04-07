'use client'

import { useEffect, useRef } from 'react'
import { Footer } from '@/components/Footer'
import { GsapReveal } from '@/components/GsapReveal'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { Nav } from '@/components/Nav'
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
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()
  const copy = useSiteCopy().workPage

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [])

  useEffect(() => {
    const el = eyebrowRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('eyebrow-animate')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
        <section className="work-hero-section border-b border-divider" style={{ padding: 'var(--layout-hero-padding-y) var(--layout-page-gutter)' }}>
          <div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
            <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: 'var(--color-red)' }} />
            <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: 'var(--color-red)' }}>{copy.eyebrow}</span>
          </div>
          <GsapReveal>
            <h1 data-reveal className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.05, marginBottom: '20px' }}>
              {heroTitle}
            </h1>
            <p data-reveal className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: 'var(--color-body)', lineHeight: 1.9, maxWidth: '480px' }}>
              {heroBody}
            </p>
          </GsapReveal>
        </section>

        <section className="work-grid-section" style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)' }}>
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

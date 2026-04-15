'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { GsapReveal } from '@/components/GsapReveal'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { ProjectCard } from '@/components/ProjectCard'
import { CreativeListingCard } from '@/components/CreativeListingCard'
import { getCaseStudyPreviewImages } from '@/lib/preview-images'
import type {
  CardStyleSettings,
  HoverPreviewSettings,
  PhotographyCardStyleSettings,
  PhotographyCity,
  WorkProject,
  CaseStudyContent,
} from '@/lib/site-content-schema'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function ScadHeader() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center"
      style={{
        padding: 'var(--layout-nav-padding-y) var(--layout-page-gutter)',
        backgroundColor: 'var(--nav-background)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--nav-border-color)',
        gap: '14px',
      }}
    >
      <Link
        href="/"
        className="font-mono"
        style={{
          fontSize: '22px',
          letterSpacing: '0.14em',
          color: 'var(--nav-logo-color)',
          textDecoration: 'none',
        }}
      >
        PR
      </Link>
      <span
        className="font-mono"
        style={{
          fontSize: 'var(--nav-link-size)',
          letterSpacing: '0.12em',
          color: '#888888',
        }}
      >
        ← explore the full site
      </span>
    </nav>
  )
}

function SectionHeader({ label, count }: { label: string; count: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1f1f1f' }}
    >
      <span
        className="font-mono"
        style={{ fontSize: 'var(--text-body)', letterSpacing: '0.14em', color: 'var(--color-heading)' }}
      >
        {label}
      </span>
      <span
        className="font-mono"
        style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.16em', color: 'var(--color-red)' }}
      >
        {count}
      </span>
    </div>
  )
}

export function ScadPageClient({
  projects,
  cities,
  mixedMediaProjects,
  cardStyle,
  photographyCardStyle,
  hoverPreviewSettings,
}: {
  projects: WorkProject[]
  cities: PhotographyCity[]
  mixedMediaProjects: CaseStudyContent[]
  cardStyle: CardStyleSettings
  photographyCardStyle: PhotographyCardStyleSettings
  hoverPreviewSettings: HoverPreviewSettings
}) {
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const workGridRef = useRef<HTMLDivElement>(null)
  const photoGridRef = useRef<HTMLDivElement>(null)
  const mixedGridRef = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()

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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const grids = [
      workGridRef.current,
      photoGridRef.current,
      mixedGridRef.current,
    ].filter((grid): grid is HTMLDivElement => grid !== null)

    if (reduced) {
      const contexts = grids.map((grid) =>
        gsap.context(() => {
          gsap.set(grid.querySelectorAll('.portfolio-card'), { opacity: 1, scale: 1 })
        }, grid)
      )
      return () => contexts.forEach((ctx) => ctx.revert())
    }

    const contexts = grids.map((grid) =>
      gsap.context(() => {
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
    )

    return () => contexts.forEach((ctx) => ctx.revert())
  }, [motion.gridRevealDuration, motion.gridRevealStagger, motion.gridStartScale])

  return (
    <>
      <ScadHeader />
      <main style={{ paddingTop: '57px' }}>

        {/* Hero */}
        <section
          className="border-b border-divider"
          style={{ padding: 'var(--layout-hero-padding-y) var(--layout-page-gutter)' }}
        >
          <div
            ref={eyebrowRef}
            className="flex items-center"
            style={{ gap: '10px', marginBottom: '24px' }}
          >
            <div style={{ width: '32px', height: '1px', backgroundColor: 'var(--color-red)' }} />
            <span
              className="eyebrow-label font-mono"
              style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: 'var(--color-red)' }}
            >
              FOR THE SCAD SCHOLARSHIP COMMITTEE
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
              <span style={{ color: 'var(--color-red)' }}>Pramit</span> Ranjan.
            </h1>
            <p
              data-reveal
              className="font-mono"
              style={{
                fontSize: 'var(--text-body-lg)',
                letterSpacing: '0.04em',
                color: 'var(--color-body)',
                lineHeight: 1.9,
                maxWidth: '760px',
              }}
            >
              UX design student at SCAD — I think like a designer but see like an artist. This page
              brings together both sides: product work grounded in research and empathy, and a
              creative practice rooted in film photography and art. Everything I make is here.
            </p>
          </GsapReveal>
        </section>

        {/* Work */}
        <section
          className="border-b border-divider"
          style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)' }}
        >
          <SectionHeader label="WORK" count={`${String(projects.length).padStart(2, '0')}`} />
          <div
            ref={workGridRef}
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ gap: 'var(--layout-card-gap)' }}
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={`${project.href}-${project.title}`}
                {...project}
                href={`${project.href}?from=scad-scholarship`}
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
          </div>
        </section>

        {/* Creative — Photography */}
        <section
          className="border-b border-divider"
          style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)' }}
        >
          <SectionHeader
            label="PHOTOGRAPHY"
            count={`${String(cities.length).padStart(2, '0')}`}
          />
          <div
            ref={photoGridRef}
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ gap: 'var(--layout-card-gap)' }}
          >
            {cities.map((city, index) => (
              <CreativeListingCard
                key={city.slug}
                title={city.title}
                desc={city.desc}
                href={city.comingSoon ? undefined : `/creative/photography/${city.slug}?from=scad-scholarship`}
                cover={city.cover}
                previewImages={city.previewImages}
                comingSoon={city.comingSoon}
                imagePosition={city.imagePosition ?? 'center'}
                imageScale={city.imageScale}
                hoverImagePosition={city.hoverImagePosition}
                hoverImageScale={city.hoverImageScale}
                cardStyle={photographyCardStyle}
                hoverPreviewSettings={hoverPreviewSettings}
                priorityImage={index < 4}
              />
            ))}
          </div>
        </section>

        {/* Creative — Mixed Media */}
        <section
          style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)' }}
        >
          <SectionHeader
            label="MIXED MEDIA"
            count={`${String(mixedMediaProjects.length).padStart(2, '0')}`}
          />
          <div
            ref={mixedGridRef}
            className="grid grid-cols-2 md:grid-cols-3"
            style={{ gap: 'var(--layout-card-gap)' }}
          >
            {mixedMediaProjects.map((project, index) => (
              <CreativeListingCard
                key={project.slug}
                title={project.title}
                desc={project.oneliner}
                tag={project.type}
                href={`/creative/mixed-media/${project.slug}?from=scad-scholarship`}
                cover={project.heroImage}
                previewImages={getCaseStudyPreviewImages(project)}
                imagePosition={project.cardImagePosition ?? 'center'}
                imageScale={project.cardImageScale}
                hoverImagePosition={project.cardHoverImagePosition}
                hoverImageScale={project.cardHoverImageScale}
                cardStyle={photographyCardStyle}
                hoverPreviewSettings={hoverPreviewSettings}
                priorityImage={index < 3}
              />
            ))}
          </div>
        </section>


      </main>
      <Footer />
    </>
  )
}

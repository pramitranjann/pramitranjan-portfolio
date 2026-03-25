'use client'

import { useEffect, useRef } from 'react'
import { Footer } from '@/components/Footer'
import { GsapReveal } from '@/components/GsapReveal'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { Nav } from '@/components/Nav'
import { CreativeListingCard } from '@/components/CreativeListingCard'
import type { CaseStudyContent, PhotographyCardStyleSettings, PhotographyCity } from '@/lib/site-content-schema'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function SectionHeader({ label, count }: { label: string; count: string }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1f1f1f' }}>
      <span className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.14em', color: '#f5f2ed' }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.16em', color: '#FF3120' }}>{count}</span>
    </div>
  )
}

export function CreativePageClient({
  cities,
  mixedMediaProjects,
  brandingProjects,
  cardStyle,
}: {
  cities: PhotographyCity[]
  mixedMediaProjects: CaseStudyContent[]
  brandingProjects: CaseStudyContent[]
  cardStyle: PhotographyCardStyleSettings
}) {
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const photoGridRef = useRef<HTMLDivElement>(null)
  const mixedGridRef = useRef<HTMLDivElement>(null)
  const brandingGridRef = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()
  const copy = useSiteCopy().creativePage

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
    const grids = [photoGridRef.current, mixedGridRef.current, brandingGridRef.current].filter((grid): grid is HTMLDivElement => grid !== null)

    if (reduced) {
      const contexts = grids.map((grid) => gsap.context(() => {
        gsap.set(grid.querySelectorAll('.portfolio-card'), { opacity: 1, scale: 1 })
      }, grid))
      return () => contexts.forEach((context) => context.revert())
    }

    const contexts = grids.map((grid) => gsap.context(() => {
      const cards = grid.querySelectorAll('.portfolio-card')
      gsap.set(cards, { opacity: 0, scale: motion.gridStartScale })
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cards, { opacity: 1, scale: 1, duration: motion.gridRevealDuration, ease: 'power2.out', stagger: motion.gridRevealStagger })
        },
        once: true,
      })
    }, grid))

    return () => contexts.forEach((context) => context.revert())
  }, [motion.gridRevealDuration, motion.gridRevealStagger, motion.gridStartScale])

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section className="creative-hero-section border-b border-divider" style={{ padding: '64px 40px' }}>
          <div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
            <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>{copy.eyebrow}</span>
          </div>
          <GsapReveal>
            <h1 data-reveal className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}>
              {copy.heroTitle}
            </h1>
            <p data-reveal className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '480px' }}>
              {copy.heroBody}
            </p>
          </GsapReveal>
        </section>

        <section className="creative-section border-b border-divider" style={{ padding: '40px' }}>
          <SectionHeader label={copy.photographyLabel} count={copy.photographyCount} />
          <div ref={photoGridRef} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            {cities.map((city) => (
              <CreativeListingCard
                key={city.slug}
                title={city.title}
                desc={city.desc}
                href={city.comingSoon ? undefined : `/creative/photography/${city.slug}`}
                cover={city.cover}
                comingSoon={city.comingSoon}
                imagePosition={city.imagePosition ?? 'center'}
                cardStyle={cardStyle}
              />
            ))}
          </div>
        </section>

        <section className="creative-section border-b border-divider" style={{ padding: '40px' }}>
          <SectionHeader label={copy.mixedMediaLabel} count={copy.mixedMediaCount} />
          <div ref={mixedGridRef} className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>
            {mixedMediaProjects.map((project) => (
              <CreativeListingCard
                key={project.slug}
                title={project.title}
                desc={project.oneliner}
                tag={project.type}
                href={`/creative/mixed-media/${project.slug}`}
                cover={project.heroImage}
                imagePosition={project.cardImagePosition ?? 'center'}
                cardStyle={cardStyle}
              />
            ))}
          </div>
        </section>

        <section className="creative-section" style={{ padding: '40px' }}>
          <SectionHeader label={copy.brandingLabel} count={copy.brandingCount} />
          <div ref={brandingGridRef} className="grid grid-cols-2" style={{ gap: '16px' }}>
            {brandingProjects.map((project) => (
              <CreativeListingCard
                key={project.slug}
                title={project.title}
                desc={project.oneliner}
                tag={project.type}
                href={`/creative/branding/${project.slug}`}
                cover={project.heroImage}
                imagePosition={project.cardImagePosition ?? 'center'}
                cardStyle={cardStyle}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

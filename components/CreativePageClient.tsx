'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { GsapReveal } from '@/components/GsapReveal'
import { Nav } from '@/components/Nav'
import { playCardEnter } from '@/lib/sounds'
import type { PhotographyCity } from '@/lib/site-content-schema'
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

function CreativeCard({ title, desc, tag, href, cover, comingSoon, imageHeight = '240px', imagePosition = 'center' }: {
  title: string
  desc: string
  tag?: string
  href?: string
  cover?: string
  comingSoon?: boolean
  imageHeight?: string
  imagePosition?: string
}) {
  const inner = (
    <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: '16px' }}>
      <div className="creative-card-image" style={{ position: 'relative', width: '100%', height: imageHeight, backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px', overflow: 'hidden' }}>
        {cover ? <Image src={cover} alt={title} fill style={{ objectFit: 'cover', objectPosition: imagePosition }} sizes="(max-width: 768px) 50vw, 25vw" /> : null}
      </div>
      <h3 className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>
        <span className="card-title-inner">{title}</span>
      </h3>
      <p className="font-mono flex-1" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.6, marginBottom: '12px' }}>{desc}</p>
      <div className="flex flex-col" style={{ gap: '6px' }}>
        {tag ? <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>{tag}</span> : null}
        {comingSoon
          ? <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>COMING SOON</span>
          : <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>
              <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
            </span>}
      </div>
    </div>
  )

  return comingSoon || !href ? <div className="h-full">{inner}</div> : <Link href={href} className="h-full block" onClick={playCardEnter}>{inner}</Link>
}

export function CreativePageClient({ cities }: { cities: PhotographyCity[] }) {
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const photoGridRef = useRef<HTMLDivElement>(null)
  const mixedGridRef = useRef<HTMLDivElement>(null)
  const brandingGridRef = useRef<HTMLDivElement>(null)

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
      gsap.set(cards, { opacity: 0, scale: 0.93 })
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cards, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.11 })
        },
        once: true,
      })
    }, grid))

    return () => contexts.forEach((context) => context.revert())
  }, [])

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section className="creative-hero-section border-b border-divider" style={{ padding: '64px 40px' }}>
          <div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
            <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>CREATIVE_</span>
          </div>
          <GsapReveal>
            <h1 data-reveal className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}>
              The other half.
            </h1>
            <p data-reveal className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '480px' }}>
              Photography, mixed media, and branding — the work that exists outside of UX.
            </p>
          </GsapReveal>
        </section>

        <section className="creative-section border-b border-divider" style={{ padding: '40px' }}>
          <SectionHeader label="PHOTOGRAPHY" count="01" />
          <div ref={photoGridRef} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            {cities.map((city) => (
              <CreativeCard
                key={city.slug}
                title={city.title}
                desc={city.desc}
                href={city.comingSoon ? undefined : `/creative/photography/${city.slug}`}
                cover={city.cover}
                comingSoon={city.comingSoon}
                imagePosition={city.imagePosition ?? 'center'}
              />
            ))}
          </div>
        </section>

        <section className="creative-section border-b border-divider" style={{ padding: '40px' }}>
          <SectionHeader label="MIXED MEDIA" count="02" />
          <div ref={mixedGridRef} className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>
            <CreativeCard title="Faces of Power" desc="Portraits, power, and the masks we wear." tag="GELLI PRINT · PHOTOGRAPHY" href="/creative/mixed-media/faces-of-power" cover="/creative/mixed-media/faces-of-power/hero-processed.png" />
            <CreativeCard title="South China Sea" desc="Conflict, naivety, and the decisions of the few." tag="CYANOTYPE · PHOTOGRAM" href="/creative/mixed-media/south-china-sea" cover="/creative/mixed-media/south-china-sea/hero-processed.png" />
            <CreativeCard title="Project 03" desc="TBC" comingSoon />
          </div>
        </section>

        <section className="creative-section" style={{ padding: '40px' }}>
          <SectionHeader label="BRANDING" count="03" />
          <div ref={brandingGridRef} className="grid grid-cols-2" style={{ gap: '16px' }}>
            <CreativeCard title="Oracle" desc="A Matrix-inspired clothing brand built from scratch." tag="CLOTHING · BRANDING" href="/creative/branding/oracle" />
            <CreativeCard title="SOHO" desc="Directed and branded a sixth form art exhibition." tag="EXHIBITION · BRANDING" href="/creative/branding/soho" cover="/creative/branding/soho/cover-processed.png" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

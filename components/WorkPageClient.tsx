'use client'

import { useEffect, useRef } from 'react'
import { Footer } from '@/components/Footer'
import { GsapReveal } from '@/components/GsapReveal'
import { Nav } from '@/components/Nav'
import { ProjectCard } from '@/components/ProjectCard'
import type { WorkProject } from '@/lib/site-content-schema'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function WorkPageClient({
  heroTitle,
  heroBody,
  projects,
}: {
  heroTitle: string
  heroBody: string
  projects: WorkProject[]
}) {
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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
      gsap.set(cards, { opacity: 0, scale: 0.93 })
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.11,
          })
        },
        once: true,
      })
    }, grid)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section className="work-hero-section border-b border-divider" style={{ padding: '64px 40px' }}>
          <div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
            <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>WORK_</span>
          </div>
          <GsapReveal>
            <h1 data-reveal className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}>
              {heroTitle}
            </h1>
            <p data-reveal className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '480px' }}>
              {heroBody}
            </p>
          </GsapReveal>
        </section>

        <section className="work-grid-section" style={{ padding: '40px' }}>
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            {projects.map((project) => (
              <ProjectCard key={`${project.href}-${project.title}`} {...project} variant="supporting" imageRatio="4 / 3" />
            ))}
            <div className="flex items-center justify-center" style={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', padding: '16px', minHeight: '160px' }}>
              <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#444444', textAlign: 'center' }}>MORE ON THE WAY_</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

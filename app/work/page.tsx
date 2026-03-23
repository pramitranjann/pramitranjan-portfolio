'use client'

import { useEffect, useRef } from 'react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ProjectCard } from '@/components/ProjectCard'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const projects = [
  { title: "Franklin's",      oneliner: "The experience starts before you walk in.",                    tags: ['UX', 'RESEARCH'],        href: '/work/franklins',       cover: '/work/franklins/cover-hor.png' },
  { title: 'LoomLearn',       oneliner: 'One learning space for students who think differently.',       tags: ['UX', 'RESEARCH'],        href: '/work/loomlearn',       cover: '/work/loomlearn/cover-hor.png' },
  { title: 'HelpOH',          oneliner: 'Connecting homes to trusted help, and workers to fair work.',  tags: ['UX', 'SERVICE DESIGN'],  href: '/work/helpoh',          cover: '/work/helpoh/cover-hor.png' },
  { title: 'Atom OS',         oneliner: 'A phone stripped down to what actually matters.',               tags: ['UI', 'SYSTEMS'],         href: '/work/atom',            cover: '/work/atom/cover-hor.png' },
  { title: 'Albers',          oneliner: 'Colour theory you can actually play with.',                     tags: ['UI', 'INTERACTION'],     href: '/work/albers',          cover: '/work/albers/cover-hor.png' },
  { title: 'Accord',          oneliner: 'A contract tool built for freelancers.',                        tags: ['UX', 'PRODUCT'],         href: '/work/accord',          cover: undefined },
  { title: 'Purcast',         oneliner: 'A podcast app designed for the Fluxathon.',                    tags: ['UI', 'COMPETITION'],     href: '/work/purcast',         cover: undefined },
]

export default function WorkPage() {
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

  // Card entrance animation — SECOND useEffect (do not merge with eyebrow observer above)
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(grid.querySelectorAll('.portfolio-card'), { opacity: 1, scale: 1 })
      return
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

        {/* Hero */}
        <section className="work-hero-section border-b border-divider" style={{ padding: '64px 40px' }}>
          <div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
            <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>WORK_</span>
          </div>
          <h1
            className="font-serif"
            style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}
          >
            All projects.
          </h1>
          <p
            className="font-mono"
            style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '480px' }}
          >
            Five projects across UX, UI, and interaction design.
          </p>
        </section>

        {/* Grid */}
        <section className="work-grid-section" style={{ padding: '40px' }}>
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            {projects.map((p) => (
              <ProjectCard key={p.title} {...p} variant="supporting" imageRatio="4 / 3" />
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

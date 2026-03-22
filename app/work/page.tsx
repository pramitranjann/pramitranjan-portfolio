'use client'

import { useEffect, useRef } from 'react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ProjectCard } from '@/components/ProjectCard'

const projects = [
  { title: "Franklin's",      oneliner: "The experience starts before you walk in.",                    tags: ['UX', 'RESEARCH'],        href: '/work/franklins',       cover: undefined },
  { title: 'LoomLearn',       oneliner: 'One learning space for students who think differently.',       tags: ['UX', 'RESEARCH'],        href: '/work/loomlearn',       cover: '/work/loomlearn/hero-1.png' },
  { title: 'HelpOH',          oneliner: 'Connecting homes to trusted help, and workers to fair work.',  tags: ['UX', 'SERVICE DESIGN'],  href: '/work/helpoh',          cover: '/work/helpoh/solution-hero.png' },
  { title: 'Atom OS',         oneliner: 'A phone stripped down to what actually matters.',               tags: ['UI', 'SYSTEMS'],         href: '/work/atom',            cover: '/work/atom/hero-1.png' },
  { title: 'Albers',          oneliner: 'Colour theory you can actually play with.',                     tags: ['UI', 'INTERACTION'],     href: '/work/albers',          cover: '/work/albers/img-3.png' },
  { title: 'Accord',          oneliner: 'A contract tool built for freelancers.',                        tags: ['UX', 'PRODUCT'],         href: '/work/accord',          cover: undefined },
  { title: 'Purcast',         oneliner: 'A podcast app designed for the Fluxathon.',                    tags: ['UI', 'COMPETITION'],     href: '/work/purcast',         cover: undefined },
  { title: 'Design-athon 01', oneliner: 'A 48-hour weather app designed with Claude AI.',               tags: ['UI', 'SPRINT'],          href: '/work/designathon-01',  cover: undefined },
  { title: 'Design-athon 02', oneliner: 'Redesigning Passio Go with Figma Make.',                       tags: ['UI', 'SPRINT'],          href: '/work/designathon-02',  cover: undefined },
]

export default function WorkPage() {
  const eyebrowRef = useRef<HTMLDivElement>(null)

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
            Seven projects across UX, UI, and interaction design.
          </p>
        </section>

        {/* Grid */}
        <section className="work-grid-section" style={{ padding: '40px' }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
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

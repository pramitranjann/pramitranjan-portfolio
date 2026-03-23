'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'Accord',   oneliner: 'A contract tool built for freelancers.',              tags: ['UX', 'PRODUCT'],        href: '/work/accord',   cover: undefined },
  { title: 'HelpOH',   oneliner: 'Connecting homes to trusted help, and workers to fair work.', tags: ['UX', 'SERVICE DESIGN'], href: '/work/helpoh', cover: '/work/helpoh/cover-hor.png' },
  { title: 'Purcast',  oneliner: 'A podcast app designed for the Fluxathon.',           tags: ['UI', 'COMPETITION'],    href: '/work/purcast',  cover: undefined },
]

export function MoreWork() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => setTimeout(() => card.classList.add('revealed'), i * 100))
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section>
      <div style={{ padding: '24px 24px 16px' }}>
        <h2
          className="font-serif"
          style={{ fontSize: 'var(--text-h3)', fontWeight: 400, color: '#FF3120', lineHeight: 1.1, marginBottom: '8px' }}
        >
          Competitions & side projects.
        </h2>
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', letterSpacing: '0.04em', lineHeight: 1.6 }}>
          48-hour briefs, weird constraints, and one accessibility tool nobody asked for but needed.
        </p>
      </div>

      <div
        ref={gridRef}
        className="card-grid grid grid-cols-1 md:grid-cols-3"
        style={{ gap: '12px', padding: '0 24px 40px' }}
      >
        {projects.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard {...p} variant="supporting" imageRatio="1 / 1" />
          </div>
        ))}
      </div>
    </section>
  )
}

'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'LoomLearn', oneliner: 'One learning space for students who think differently.',       tags: ['UX', 'ED-TECH'],       href: '/work/loomlearn' },
  { title: 'HelpOH',    oneliner: 'Connecting homes to trusted help, and workers to fair pay.',   tags: ['UX', 'SOCIAL IMPACT'], href: '/work/helpoh' },
  { title: 'Atom OS',   oneliner: 'A phone stripped down to what actually matters.',               tags: ['UX', 'PRODUCT'],       href: '/work/atom' },
  { title: 'Albers',    oneliner: 'Colour theory you can actually play with.',                     tags: ['CREATIVE', 'CODE'],    href: '/work/albers' },
]

export function SelectedWork() {
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
      { threshold: 0.1 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section style={{ borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f' }}>
      <div style={{ padding: '48px 24px 0' }}>
        {/* Section heading */}
        <h2 className="font-serif italic" style={{ fontSize: '36px', fontWeight: 400, color: '#FF3120', lineHeight: 1.1, marginBottom: '10px' }}>
          Research to resolution.
        </h2>
        {/* Callout */}
        <p className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.06em', color: '#444444', lineHeight: 1.7 }}>
          Four projects in UX — each one starting with a question worth asking.
        </p>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2"
        style={{ gap: '12px', padding: '20px 24px 40px' }}
      >
        {projects.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard {...p} variant="supporting" />
          </div>
        ))}
      </div>
    </section>
  )
}

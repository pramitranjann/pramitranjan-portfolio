'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'LoomLearn', oneliner: 'One learning space for students who think differently.',       tags: ['UX', 'RESEARCH'],        href: '/work/loomlearn' },
  { title: 'HelpOH',    oneliner: 'Connecting homes to trusted help, and workers to fair pay.',   tags: ['UX', 'SERVICE DESIGN'],  href: '/work/helpoh' },
  { title: 'Atom OS',   oneliner: 'A phone stripped down to what actually matters.',               tags: ['UI', 'SYSTEMS'],         href: '/work/atom' },
  { title: 'Albers',    oneliner: 'Colour theory you can actually play with.',                     tags: ['UI', 'INTERACTION'],     href: '/work/albers' },
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
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('revealed'), i * 100)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between mb-6 border-b border-divider"
        style={{ paddingBottom: '16px' }}
      >
        <span
          className="font-mono"
          style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}
        >
          SELECTED WORK
        </span>
        <span
          className="font-mono"
          style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120' }}
        >
          04
        </span>
      </div>

      {/* 2×2 grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2"
        style={{ gap: '2px' }}
      >
        {projects.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard {...p} variant="main" />
          </div>
        ))}
      </div>
    </section>
  )
}

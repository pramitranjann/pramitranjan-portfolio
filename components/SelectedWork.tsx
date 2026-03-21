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
      { threshold: 0.2 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section>
      {/* Section header */}
      <div
        className="flex justify-between items-baseline"
        style={{ padding: '32px 24px 8px' }}
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
        style={{ gap: '2px', padding: '12px 24px 40px' }}
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

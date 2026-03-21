'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'Accord',          oneliner: '', tags: ['UX', 'ACCESSIBILITY'], href: '/work/accord' },
  { title: 'Design-athon 01', oneliner: '', tags: ['UX', 'COMPETITION'],   href: '/work/designathon-01' },
  { title: 'Design-athon 02', oneliner: '', tags: ['UX', 'COMPETITION'],   href: '/work/designathon-02' },
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
      <div style={{ padding: '48px 24px 0' }}>
        {/* Section heading — smaller than Selected Work */}
        <h2 className="font-serif italic" style={{ fontSize: '22px', fontWeight: 400, color: '#FF3120', lineHeight: 1.1 }}>
          Competitions & side projects.
        </h2>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-3"
        style={{ gap: '12px', padding: '16px 24px 40px' }}
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

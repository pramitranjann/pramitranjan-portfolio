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
      <div
        className="flex justify-between items-baseline"
        style={{ padding: '32px 24px 8px' }}
      >
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
          MORE WORK
        </span>
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120' }}>
          03
        </span>
      </div>
      <div
        ref={gridRef}
        className="grid grid-cols-3"
        style={{ gap: '12px', padding: '12px 24px 40px' }}
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

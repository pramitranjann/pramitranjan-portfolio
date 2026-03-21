'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'Accord',          oneliner: 'A contract tool built for freelancers.',             tags: ['UX', 'PRODUCT'], href: '/work/accord' },
  { title: 'Design-athon 01', oneliner: 'A 48-hour weather app designed with Claude AI.',     tags: ['UI', 'SPRINT'],  href: '/work/designathon-01' },
  { title: 'Design-athon 02', oneliner: 'Redesigning Passio Go with Figma Make.',             tags: ['UI', 'SPRINT'],  href: '/work/designathon-02' },
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
    <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
      <div className="flex items-center justify-between mb-6 border-b border-divider" style={{ paddingBottom: '16px' }}>
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
          MORE WORK
        </span>
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120' }}>
          03
        </span>
      </div>
      <div ref={gridRef} className="grid grid-cols-3" style={{ gap: '2px' }}>
        {projects.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard {...p} variant="supporting" />
          </div>
        ))}
      </div>
    </section>
  )
}

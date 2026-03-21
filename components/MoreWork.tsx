'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'Accord',          oneliner: '', tags: ['UX', 'ACCESSIBILITY'], href: '/work/accord' },
  { title: 'Design-athon 01', oneliner: '', tags: ['UX', 'COMPETITION'],   href: '/work/designathon-01' },
  { title: 'Design-athon 02', oneliner: '', tags: ['UX', 'COMPETITION'],   href: '/work/designathon-02' },
]

export function MoreWork() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

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
        style={{ gap: '12px', padding: '0 24px 40px', overflow: 'visible' }}
      >
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            className="reveal"
            style={{ zIndex: hoveredIdx === i ? 2 : 1 }}
            animate={{
              scale: hoveredIdx === i ? 1.03 : hoveredIdx !== null ? 0.97 : 1,
              opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.65 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <ProjectCard {...p} variant="supporting" hovered={hoveredIdx === i} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

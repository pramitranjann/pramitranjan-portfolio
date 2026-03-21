'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'LoomLearn', oneliner: 'One learning space for students who think differently.',       tags: ['UX', 'ED-TECH'],       href: '/work/loomlearn' },
  { title: 'HelpOH',    oneliner: 'Connecting homes to trusted help, and workers to fair pay.',   tags: ['UX', 'SOCIAL IMPACT'], href: '/work/helpoh' },
  { title: 'Atom OS',   oneliner: 'A phone stripped down to what actually matters.',               tags: ['UX', 'PRODUCT'],       href: '/work/atom' },
  { title: 'Albers',    oneliner: 'Colour theory you can actually play with.',                     tags: ['CREATIVE', 'CODE'],    href: '/work/albers' },
]

export function SelectedWork() {
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
      { threshold: 0.1 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section style={{ borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f' }}>
      {/* Section header — 40px top padding, 24px sides */}
      <div style={{ padding: '40px 24px 24px' }}>
        <h2
          className="font-serif"
          style={{ fontSize: '36px', fontWeight: 400, color: '#FF3120', lineHeight: 1.1, marginBottom: '12px' }}
        >
          Research to resolution.
        </h2>
        {/* WCAG AA compliant: #999 on #0d0d0d = 6.5:1 contrast */}
        <p
          className="font-mono"
          style={{ fontSize: '13px', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.7, maxWidth: '480px' }}
        >
          Four projects in UX — each one starting with a question worth asking.
        </p>
      </div>

      <div
        ref={gridRef}
        className="card-grid grid grid-cols-2"
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

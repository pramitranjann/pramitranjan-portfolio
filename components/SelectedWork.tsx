'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'
import type { HomeSection } from '@/lib/site-content-schema'

export function SelectedWork({ content }: { content: HomeSection }) {
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
    <section>
      <div style={{ padding: '40px 24px 24px' }}>
        <h2
          className="font-serif"
          style={{ fontSize: 'var(--text-h2)', fontWeight: 400, color: '#FF3120', lineHeight: 1.1, marginBottom: '12px' }}
        >
          {content.heading}
        </h2>
        <p
          className="font-mono"
          style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.7, maxWidth: '480px' }}
        >
          {content.body}
        </p>
      </div>

      <div
        ref={gridRef}
        className="card-grid grid grid-cols-2 md:grid-cols-4"
        style={{ gap: '16px', padding: '0 24px 40px' }}
      >
        {content.items.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard {...p} variant="supporting" />
          </div>
        ))}
      </div>
    </section>
  )
}

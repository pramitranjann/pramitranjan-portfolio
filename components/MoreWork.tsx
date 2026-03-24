'use client'
import { useEffect, useRef } from 'react'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { ProjectCard } from './ProjectCard'
import type { CardStyleSettings, HomeSection } from '@/lib/site-content-schema'

export function MoreWork({ content, cardStyle }: { content: HomeSection; cardStyle: CardStyleSettings }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => setTimeout(() => card.classList.add('revealed'), i * motion.simpleRevealStagger * 1000))
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [motion.simpleRevealStagger])

  return (
    <section>
      <div style={{ padding: '24px 24px 16px' }}>
        <h2
          className="font-serif"
          style={{ fontSize: 'var(--text-h3)', fontWeight: 400, color: '#FF3120', lineHeight: 1.1, marginBottom: '8px' }}
        >
          {content.heading}
        </h2>
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', letterSpacing: '0.04em', lineHeight: 1.6 }}>
          {content.body}
        </p>
      </div>

      <div
        ref={gridRef}
        className="card-grid grid grid-cols-2 md:grid-cols-3"
        style={{ gap: '12px', padding: '0 24px 40px' }}
      >
        {content.items.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard
              {...p}
              variant="supporting"
              imageRatio={cardStyle.imageRatio}
              titleSize={cardStyle.titleSize}
              metaSize={cardStyle.metaSize}
              cardPadding={cardStyle.cardPadding}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

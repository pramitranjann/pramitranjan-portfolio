'use client'
import { useEffect, useRef } from 'react'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { ProjectCard } from './ProjectCard'
import type { CardStyleSettings, HomeSection, HoverPreviewSettings } from '@/lib/site-content-schema'

export function SelectedWork({
  content,
  cardStyle,
  hoverPreviewSettings,
}: {
  content: HomeSection
  cardStyle: CardStyleSettings
  hoverPreviewSettings: HoverPreviewSettings
}) {
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
      { threshold: 0.1 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [motion.simpleRevealStagger])

  return (
    <section>
      <div style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter) 24px' }}>
        <h2
          className="font-serif"
          style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-red)', lineHeight: 1.1, marginBottom: '12px' }}
        >
          {content.heading}
        </h2>
        <p
          className="font-mono"
          style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: 'var(--color-body)', lineHeight: 1.7, maxWidth: '480px' }}
        >
          {content.body}
        </p>
      </div>

      <div
        ref={gridRef}
        className="card-grid grid grid-cols-2 md:grid-cols-4"
        style={{ gap: 'var(--layout-card-gap)', padding: `0 var(--layout-page-gutter) var(--layout-section-padding-y)` }}
      >
        {content.items.map((p, index) => (
          <div key={p.title} className="reveal">
            <ProjectCard
              {...p}
              variant="supporting"
              imageRatio={cardStyle.imageRatio}
              titleSize={cardStyle.titleSize}
              metaSize={cardStyle.metaSize}
              cardPadding={cardStyle.cardPadding}
              imageFit={cardStyle.imageFit}
              imageBackground={cardStyle.imageBackground}
              imageBorderColor={cardStyle.imageBorderColor}
              imageBorderWidth={cardStyle.imageBorderWidth}
              hoverPreviewSettings={hoverPreviewSettings}
              priorityImage={index < 4}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

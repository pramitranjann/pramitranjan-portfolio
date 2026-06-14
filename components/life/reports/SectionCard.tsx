'use client'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { sectionKey, type ReportSection } from '@/lib/life/markdown-sections'

const PULL_QUOTE_KEYS = new Set(['one-thing', 'one-intention'])

export function SectionCard({ section }: { section: ReportSection }) {
  const key = sectionKey(section.label)
  const isPullQuote = PULL_QUOTE_KEYS.has(key)
  const isTension = key === 'tension'

  if (isPullQuote) {
    return (
      <section className={`life-section-card life-section-${key} life-section-pullquote`}>
        <p className="eyebrow">{section.label}</p>
        <MarkdownCard content={section.body} />
      </section>
    )
  }

  return (
    <section
      className={`life-section-card life-section-${key} ${isTension ? 'life-section-tension' : ''}`}
    >
      <p className="eyebrow">{section.label}</p>
      <MarkdownCard content={section.body} />
    </section>
  )
}

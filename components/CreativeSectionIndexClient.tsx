'use client'

import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { CreativeListingCard } from '@/components/CreativeListingCard'
import { playNav } from '@/lib/sounds'
import type { CaseStudyContent, PhotographyCardStyleSettings } from '@/lib/site-content-schema'

export function CreativeSectionIndexClient({
  title,
  backHref,
  backLabel,
  columnsClass,
  projects,
  cardStyle,
}: {
  title: string
  backHref: string
  backLabel: string
  columnsClass: string
  projects: CaseStudyContent[]
  cardStyle: PhotographyCardStyleSettings
}) {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section style={{ padding: '48px 40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href={backHref} className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }} onPointerDown={playNav}>
              <span className="arrow-nudge-back">←</span> {backLabel}
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '40px' }}>
            {title}
          </h1>
          <div className={columnsClass} style={{ gap: '16px' }}>
            {projects.map((project) => (
              <CreativeListingCard
                key={project.slug}
                title={project.title}
                desc={project.oneliner}
                tag={project.type}
                href={`/creative/${project.section}/${project.slug}`}
                cover={project.heroImage}
                imagePosition={project.cardImagePosition ?? 'center'}
                cardStyle={cardStyle}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

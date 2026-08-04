'use client'

import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { CreativeListingCard } from '@/components/CreativeListingCard'
import { playNav } from '@/lib/sounds'
import type { CaseStudyContent, PhotographyCardStyleSettings } from '@/lib/site-content-schema'
import { getCaseStudyPreviewImages } from '@/lib/preview-images'

export function CreativeSectionIndexClient({
  title,
  backHref,
  backLabel,
  columnsClass,
  imageSizes,
  projects,
  cardStyle,
}: {
  title: string
  backHref: string
  backLabel: string
  columnsClass: string
  /* Must track columnsClass. CreativeListingCard defaults to the 4-up
     photography width, which under-requests badly in a 2-up grid. */
  imageSizes?: string
  projects: CaseStudyContent[]
  cardStyle: PhotographyCardStyleSettings
}) {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href={backHref} className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: 'var(--back-link-color)', textDecoration: 'none' }} onPointerDown={playNav}>
              <span className="arrow-nudge-back">←</span> {backLabel}
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.05, marginBottom: '40px' }}>
            {title}
          </h1>
          <div className={columnsClass} style={{ gap: 'var(--layout-card-gap)' }}>
            {projects.map((project, index) => (
              <CreativeListingCard
                key={project.slug}
                title={project.title}
                desc={project.oneliner}
                tag={project.type}
                href={`/play/${project.section}/${project.slug}`}
                cover={project.heroImage}
                previewImages={getCaseStudyPreviewImages(project)}
                imagePosition={project.cardImagePosition ?? 'center'}
                imageScale={project.cardImageScale}
                hoverImagePosition={project.cardHoverImagePosition}
                hoverImageScale={project.cardHoverImageScale}
                cardStyle={cardStyle}
                sizes={imageSizes}
                priorityImage={index < 3}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

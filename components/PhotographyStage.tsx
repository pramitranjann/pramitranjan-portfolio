'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import type { PhotographyCity } from '@/lib/site-content-schema'

const FRAME_W = 124
const FRAME_H = 268
const SIDE_PAD = 12
const FRAME_GAP = 5
const HOLE_COUNT = 26

/* One frame per city, numbered in order. The covers and routes were previously written out
   again here, so adding a city updated /play but never this strip. */
function buildFrames(cities: PhotographyCity[]) {
  let frame = 0
  return cities.flatMap((city) =>
    (city.stripCovers ?? (city.cover ? [city.cover] : [])).map((cover) => {
      frame += 1
      return {
        label: `${city.shortCode ?? city.title.toUpperCase()} · ${String(frame).padStart(3, '0')}`,
        href: `/play/photography/${city.slug}`,
        cover,
      }
    })
  )
}

function Holes() {
  return (
    <div className="flex" style={{ gap: '14px', padding: `0 ${SIDE_PAD}px` }}>
      {Array.from({ length: HOLE_COUNT }).map((_, i) => (
        <div key={i} className="flex-shrink-0" style={{ width: '10px', height: '7px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-divider)', borderRadius: '2px' }} />
      ))}
    </div>
  )
}

export function PhotographyStage({ cities }: { cities: PhotographyCity[] }) {
  const copy = useSiteCopy().home
  const frames = buildFrames(cities)

  return (
    <section className="photography-section" style={{
      borderTop: '1px solid var(--color-divider)',
      borderBottom: '1px solid var(--color-divider)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '480px',
      alignItems: 'stretch',
      padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)',
      gap: '56px',
    }}>
      {/* Text left */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <AnimatedEyebrow label={copy.photographyEyebrow} marginBottom="22px" />
          <h2
            className="font-serif"
            style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-serif)', fontStyle: 'italic', color: 'var(--color-heading)', lineHeight: 1.1, marginBottom: '24px' }}
            dangerouslySetInnerHTML={{ __html: copy.photographyTitleHtml }}
          />
          <p className="font-reading" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.06em', color: 'var(--color-heading)', lineHeight: 1.9, maxWidth: '340px' }}>
            {copy.photographyBody}
            {/* Phone only — inline with the text, same link as the desktop one below. */}
            <Link
              href="/play/photography"
              className="font-mono photography-view-all-mobile"
              style={{ fontSize: 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.12em', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '14px', display: 'none' }}
            >
              {copy.photographyCtaLabel}
            </Link>
          </p>
        </div>
        <Link href="/play/photography" className="font-mono photography-view-all-desktop" style={{ display: 'inline-block', marginTop: '24px', fontSize: 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.12em', textDecoration: 'none' }}>
          {copy.photographyCtaLabel}
        </Link>
      </div>

      {/* Film strip — hidden on mobile */}
      <div className="film-strip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{ backgroundColor: '#060606', padding: '14px 0', width: 'fit-content', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Holes />
          <div className="flex" style={{ gap: `${FRAME_GAP}px`, padding: `8px ${SIDE_PAD}px` }}>
            {frames.map((frame) => (
              <Link key={frame.label} href={frame.href} className="portfolio-card flex-shrink-0" style={{ display: 'block' }}>
                <div style={{ position: 'relative', width: `${FRAME_W}px`, height: `${FRAME_H}px`, backgroundColor: 'var(--color-placeholder)', border: '1px solid #222222', overflow: 'hidden' }}>
                  <Image
                    src={frame.cover}
                    alt={frame.label}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="124px"
                  />
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '10px',
                    color: 'var(--color-red)',
                    textAlign: 'center',
                    marginTop: '4px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    letterSpacing: '0.1em',
                    lineHeight: 1,
                  }}
                >
                  {frame.label}
                </div>
              </Link>
            ))}
          </div>
          <Holes />
        </div>
      </div>
    </section>
  )
}

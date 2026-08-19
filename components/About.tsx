'use client'
import { useEffect, useRef } from 'react'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import Link from 'next/link'
import { SpotifyWidget } from '@/components/SpotifyWidget'
import type { ListeningCardStyleSettings } from '@/lib/site-content-schema'

export function About({
  body,
  spotifyLabel,
  listeningStyle,
}: {
  body: string
  spotifyLabel: string
  listeningStyle: ListeningCardStyleSettings
}) {
  const secRef = useRef<HTMLElement>(null)
  const motion = useMotionSettings()
  const copy = useSiteCopy().home

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(el.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * motion.simpleRevealStagger * 1000))
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [motion.simpleRevealStagger])

  return (
    <section
      ref={secRef}
      className="about-section"
      style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'stretch', gap: 'var(--about-aside-gap, 48px)' }}
    >
      <div style={{ minWidth: 0 }}>
        <AnimatedEyebrow label={copy.aboutEyebrow} marginBottom="16px" />

        <h2
          className="reveal-text font-serif"
          style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.05, marginBottom: '20px' }}
          dangerouslySetInnerHTML={{ __html: copy.aboutTitleHtml }}
        />

        <p
          className="reveal-text font-reading"
          style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-heading)', lineHeight: 1.9, maxWidth: '440px', letterSpacing: '0.04em' }}
        >
          {body}
          {/* Phone only — inline with the text, same link as the desktop one below. */}
          <Link
            href="/about"
            className="font-mono about-read-more-mobile"
            style={{ fontSize: 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.12em', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '14px', display: 'none' }}
          >
            {copy.aboutReadMoreLabel}
          </Link>
        </p>
      </div>

      <div
        className="about-aside"
        style={{
          display: 'grid',
          alignSelf: 'stretch',
          alignContent: 'space-between',
          gap: 'var(--about-aside-stack-gap, 14px)',
          minWidth: 'var(--about-aside-width, 250px)',
        }}
      >
        <div className="reveal-text" style={{ transform: 'translateY(var(--about-widget-nudge, 0px))' }}>
          <SpotifyWidget variant="sidebar" restingLabel={spotifyLabel.replace(/_+$/, '')} styleSettings={listeningStyle} interactionMode="hover-expand" />
        </div>
        <Link
          href="/about"
          className="font-mono about-read-more-desktop"
          style={{ fontSize: 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.12em', textDecoration: 'none', whiteSpace: 'nowrap', justifySelf: 'var(--about-link-justify, end)', transform: 'translateY(var(--about-link-nudge, 0px))' }}
        >
          {copy.aboutReadMoreLabel}
        </Link>
      </div>
    </section>
  )
}

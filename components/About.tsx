'use client'
import { useEffect, useRef } from 'react'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
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
      style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: '48px' }}
    >
      <div style={{ minWidth: 0 }}>
        {/* WCAG AA: #666 on #0d0d0d = 3.1:1 — decorative label, large enough */}
        <div
          className="font-mono"
          style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#666666', marginBottom: '16px' }}
        >
          ABOUT_
        </div>

        <h2
          className="reveal-text font-serif"
          style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}
        >
          Artist.<br />Designer.<br /><span style={{ color: '#FF3120' }}>Human.</span>
        </h2>

        <p
          className="reveal-text font-mono"
          style={{ fontSize: 'var(--text-body-lg)', color: '#999999', lineHeight: 1.9, maxWidth: '440px', letterSpacing: '0.04em' }}
        >
          {body}
        </p>
      </div>

      <div className="about-body-row reveal-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '14px', minWidth: '250px' }}>
        <div style={{ minWidth: '250px' }}>
          <SpotifyWidget variant="sidebar" restingLabel={spotifyLabel.replace(/_+$/, '')} styleSettings={listeningStyle} />
        </div>
        <Link
          href="/about"
          className="font-mono"
          style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.12em', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          READ MORE <span className="arrow-nudge">→</span>
        </Link>
      </div>
    </section>
  )
}

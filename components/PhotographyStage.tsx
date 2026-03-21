'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

const frames = [
  { label: 'KL · 001', width: 76 },
  { label: 'KL · 002', width: 76 },
  { label: 'PG · 003', width: 58 },
]

function CompactFilmStrip() {
  function Holes() {
    return (
      <div className="flex" style={{ gap: '14px', padding: '0 10px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0"
            style={{ width: '10px', height: '7px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: '2px' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#060606', padding: '10px 0' }}>
      <Holes />
      <div className="flex" style={{ gap: '3px', padding: '6px 10px', overflow: 'hidden' }}>
        {frames.map((frame) => (
          <div key={frame.label} className="flex-shrink-0">
            <div style={{ width: `${frame.width}px`, height: '110px', backgroundColor: '#161616', border: '1px solid #222222' }} />
            <div
              className="font-mono"
              style={{ fontSize: '7px', color: '#FF3120', textAlign: 'center', marginTop: '3px', letterSpacing: '0.1em' }}
            >
              {frame.label}
            </div>
          </div>
        ))}
        {/* partial faded frame */}
        <div className="flex-shrink-0" style={{ opacity: 0.3 }}>
          <div style={{ width: '36px', height: '110px', backgroundColor: '#161616', border: '1px solid #222222' }} />
        </div>
      </div>
      <Holes />
    </div>
  )
}

export function PhotographyStage() {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(el.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * 200))
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="border-t border-b border-divider"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '200px', alignItems: 'center', padding: '36px 24px', gap: '32px' }}
    >
      {/* Text left */}
      <div ref={textRef}>
        <div className="flex items-center" style={{ gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
          <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}>
            THE EYE CAME FIRST.
          </span>
        </div>

        <h2
          className="reveal-text font-serif italic"
          style={{ fontSize: '28px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2, marginBottom: '16px' }}
        >
          Before <span style={{ color: '#FF3120' }}>Figma,</span><br />there was <span style={{ color: '#FF3120' }}>film.</span>
        </h2>

        <p
          className="reveal-text font-mono"
          style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#999999', lineHeight: 1.8, maxWidth: '280px' }}
        >
          Street photography across Southeast Asia. Shot on 35mm and medium format. Always looking.
        </p>

        <Link
          href="/creative/photography"
          className="reveal-text font-mono"
          style={{ display: 'inline-block', marginTop: '16px', fontSize: '9px', color: '#FF3120', letterSpacing: '0.12em', textDecoration: 'none' }}
        >
          VIEW ALL →
        </Link>
      </div>

      {/* Compact film strip right */}
      <CompactFilmStrip />
    </section>
  )
}

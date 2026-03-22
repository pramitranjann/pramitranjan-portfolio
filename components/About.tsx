'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

export function About() {
  const secRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(el.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * 200))
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={secRef}
      className="about-section"
      style={{ borderTop: '1px solid #1f1f1f', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
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

      <div className="about-body-row flex justify-between items-end" style={{ gap: '32px' }}>
        <p
          className="reveal-text font-mono"
          style={{ fontSize: 'var(--text-body-lg)', color: '#999999', lineHeight: 1.9, maxWidth: '440px', letterSpacing: '0.04em' }}
        >
          UX design student at SCAD, figuring out what good design can actually do. I think like a designer but see like an artist. Still learning. Always curious.
        </p>
        <Link
          href="/about"
          className="reveal-text font-mono flex-shrink-0"
          style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.12em', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          READ MORE →
        </Link>
      </div>
    </section>
  )
}

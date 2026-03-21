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
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={secRef}
      style={{ borderTop: '1px solid #1f1f1f', padding: '48px 24px 32px' }}
    >
      <div
        className="font-mono"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#666666', marginBottom: '16px' }}
      >
        ABOUT_
      </div>

      <h2
        className="reveal-text font-serif"
        style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '24px' }}
      >
        Artist.<br />Designer.<br /><span style={{ color: '#FF3120' }}>Human.</span>
      </h2>

      <div className="flex justify-between items-end" style={{ gap: '24px' }}>
        <p
          className="reveal-text font-mono"
          style={{ fontSize: '12px', color: '#999999', lineHeight: 1.9, maxWidth: '400px' }}
        >
          UX design student at SCAD, figuring out what good design can actually do. I think like a designer but see like an artist. Still learning. Always curious.
        </p>
        <Link
          href="/about"
          className="reveal-text font-mono flex-shrink-0"
          style={{ fontSize: '9px', color: '#FF3120', letterSpacing: '0.12em', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '24px' }}
        >
          READ MORE →
        </Link>
      </div>
    </section>
  )
}

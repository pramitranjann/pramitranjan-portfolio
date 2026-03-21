'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'

export function HeroStage02() {
  const secRef  = useRef<HTMLElement>(null)
  const tagRef  = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => tagRef.current?.classList.add('revealed'), 0)
          setTimeout(() => descRef.current?.classList.add('revealed'), 400)
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
      className="flex flex-col justify-center border-b border-divider"
      style={{ minHeight: '100vh', padding: '48px 24px' }}
    >
      <RuleLabel number="02" />

      <h2
        ref={tagRef}
        className="reveal-text font-serif italic"
        style={{ fontSize: 'clamp(48px, 9vw, 96px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05 }}
      >
        From <span style={{ color: '#FF3120' }}>Film</span><br />
        to <span style={{ color: '#FF3120' }}>Figma.</span>
      </h2>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-8"
        style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#999999', maxWidth: '380px', lineHeight: 1.9 }}
      >
        A creative background shapes how I see problems. Photography, mixed media, and art — before Figma, before UX.
      </p>
    </section>
  )
}

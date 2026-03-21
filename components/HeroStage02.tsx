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
          setTimeout(() => descRef.current?.classList.add('revealed'), 300)
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
      className="flex flex-col justify-center border-b border-divider"
      style={{ minHeight: '200px', padding: '48px 24px' }}
    >
      <RuleLabel number="02" />

      <h2
        ref={tagRef}
        className="reveal-text font-serif italic"
        style={{ fontSize: '32px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2 }}
      >
        From <span style={{ color: '#FF3120' }}>Film</span> to <span style={{ color: '#FF3120' }}>Figma.</span>
      </h2>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '340px', lineHeight: 1.8 }}
      >
        A creative background shapes how I see problems. Photography, mixed media, and art — before Figma, before UX.
      </p>
    </section>
  )
}

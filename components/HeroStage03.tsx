'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'

export function HeroStage03() {
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
      className="flex flex-col justify-end border-b border-divider"
      style={{ minHeight: '100vh', padding: '48px 24px' }}
    >
      <div
        className="font-mono mb-8 select-none"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}
      >
        03
      </div>

      <RuleLabel number="03" />

      <h2
        ref={tagRef}
        className="reveal-text font-serif italic"
        style={{ fontSize: '32px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2 }}
      >
        Design that <span style={{ color: '#FF3120' }}>solves</span>. Art that <span style={{ color: '#FF3120' }}>questions</span>.
      </h2>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '400px' }}
      >
        UX work grounded in research and empathy. Creative work that pushes further.
      </p>
    </section>
  )
}

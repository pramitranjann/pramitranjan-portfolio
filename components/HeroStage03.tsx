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
      className="flex flex-col justify-center border-b border-divider"
      style={{ minHeight: '200px', padding: '48px 24px' }}
    >
      <RuleLabel number="03" />

      <h2
        ref={tagRef}
        className="reveal-text font-serif italic"
        style={{ fontSize: '32px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2 }}
      >
        Design that <span style={{ color: '#FF3120' }}>solves.</span><br />
        Art that <span style={{ color: '#FF3120' }}>questions.</span>
      </h2>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '340px', lineHeight: 1.8 }}
      >
        UX work grounded in research and empathy. Creative work that pushes further.
      </p>

      <div className="flex items-center mt-6" style={{ gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#1f1f1f' }} />
        <span
          className="font-mono"
          style={{ fontSize: '9px', color: '#FF3120', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}
        >
          SEE WORK ↓
        </span>
      </div>
    </section>
  )
}

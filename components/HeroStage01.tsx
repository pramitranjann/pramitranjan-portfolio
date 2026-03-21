'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'

export function HeroStage01() {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    setTimeout(() => nameRef.current?.classList.add('revealed'), 0)
    setTimeout(() => descRef.current?.classList.add('revealed'), 400)
  }, [])

  return (
    <section
      className="snap-section flex flex-col justify-center border-b border-divider"
      style={{ minHeight: '100vh', padding: '80px 32px 64px', position: 'relative' }}
    >
      <RuleLabel number="01" />

      <h1
        ref={nameRef}
        className="reveal-text font-serif"
        style={{ fontSize: 'clamp(72px, 14vw, 140px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 0.95 }}
      >
        Pramit<br />Ranjan
      </h1>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-10"
        style={{ fontSize: '13px', letterSpacing: '0.08em', color: '#999999', maxWidth: '420px', lineHeight: 1.9 }}
      >
        UX design student at SCAD. Figuring out what good design can actually do.
      </p>

      <div
        className="font-mono select-none"
        style={{ position: 'absolute', right: '32px', bottom: '36px', fontSize: '9px', color: '#2a2a2a', letterSpacing: '0.14em' }}
      >
        SCROLL ↓
      </div>
    </section>
  )
}

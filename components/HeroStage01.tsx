'use client'
import { useEffect, useRef } from 'react'

export function HeroStage01() {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    setTimeout(() => nameRef.current?.classList.add('revealed'), 0)
    setTimeout(() => descRef.current?.classList.add('revealed'), 400)
  }, [])

  return (
    <section
      className="flex flex-col justify-center border-b border-divider"
      style={{ minHeight: '100vh', padding: '48px 24px', position: 'relative' }}
    >
      <div
        className="font-mono mb-6 select-none"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#2a2a2a' }}
      >
        01 ——
      </div>

      <h1
        ref={nameRef}
        className="reveal-text font-serif"
        style={{ fontSize: 'clamp(72px, 14vw, 140px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 0.95 }}
      >
        Pramit<br />Ranjan
      </h1>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-8"
        style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#999999', maxWidth: '380px', lineHeight: 1.9 }}
      >
        UX design student at SCAD. Figuring out what good design can actually do.
      </p>

      <div
        className="font-mono select-none"
        style={{ position: 'absolute', right: '24px', bottom: '32px', fontSize: '9px', color: '#2a2a2a', letterSpacing: '0.12em' }}
      >
        SCROLL ↓
      </div>
    </section>
  )
}

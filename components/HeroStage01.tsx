'use client'
import { useEffect, useRef } from 'react'

export function HeroStage01() {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    setTimeout(() => nameRef.current?.classList.add('revealed'), 0)
    setTimeout(() => descRef.current?.classList.add('revealed'), 300)
  }, [])

  return (
    <section
      className="flex flex-col justify-center border-b border-divider"
      style={{ minHeight: '220px', padding: '48px 24px', position: 'relative' }}
    >
      <div
        className="font-mono mb-4 select-none"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#2a2a2a' }}
      >
        01 ——
      </div>

      <h1
        ref={nameRef}
        className="reveal-text font-serif"
        style={{ fontSize: '58px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1 }}
      >
        Pramit<br />Ranjan
      </h1>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '340px', lineHeight: 1.8 }}
      >
        UX design student at SCAD. Figuring out what good design can actually do.
      </p>

      <div
        className="font-mono select-none"
        style={{ position: 'absolute', right: '24px', bottom: '24px', fontSize: '9px', color: '#2a2a2a', letterSpacing: '0.1em' }}
      >
        SCROLL ↓
      </div>
    </section>
  )
}

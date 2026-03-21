'use client'
import { useEffect, useRef } from 'react'

export function HeroStage01() {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // Page-load trigger (no IntersectionObserver needed for first stage)
    setTimeout(() => nameRef.current?.classList.add('revealed'), 0)
    setTimeout(() => descRef.current?.classList.add('revealed'), 300)
  }, [])

  return (
    <section
      className="min-h-screen flex flex-col justify-end border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      <div
        className="font-mono mb-8 select-none"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#2a2a2a' }}
      >
        01
      </div>

      <h1
        ref={nameRef}
        className="reveal-text font-serif"
        style={{ fontSize: '58px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05 }}
      >
        Pramit Ranjan
      </h1>

      <p
        ref={descRef}
        className="reveal-text font-mono mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '360px' }}
      >
        UX design student at SCAD. Figuring out what good design can actually do.
      </p>
    </section>
  )
}

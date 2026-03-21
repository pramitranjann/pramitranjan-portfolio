'use client'
import { useEffect, useRef, useState } from 'react'
import { RuleLabel } from './RuleLabel'

const TOTAL = 3

const stageContent = [
  // Stage 0
  <>
    <RuleLabel number="01" />
    <h1 className="font-serif" style={{ fontSize: 'clamp(72px, 13vw, 130px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 0.95 }}>
      Pramit<br />Ranjan
    </h1>
    <p className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.08em', color: '#999999', maxWidth: '420px', lineHeight: 1.9, marginTop: '40px' }}>
      UX design student at SCAD. Figuring out what good design can actually do.
    </p>
    <div className="font-mono select-none" style={{ position: 'absolute', right: '32px', bottom: '36px', fontSize: '9px', color: '#2a2a2a', letterSpacing: '0.14em' }}>
      SCROLL ↓
    </div>
  </>,

  // Stage 1
  <>
    <RuleLabel number="02" />
    <h2 className="font-serif italic" style={{ fontSize: 'clamp(48px, 9vw, 96px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05 }}>
      From <span style={{ color: '#FF3120' }}>Film</span><br />to <span style={{ color: '#FF3120' }}>Figma.</span>
    </h2>
    <p className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.08em', color: '#999999', maxWidth: '420px', lineHeight: 1.9, marginTop: '40px' }}>
      A creative background shapes how I see problems. Photography, mixed media, and art — before Figma, before UX.
    </p>
  </>,

  // Stage 2
  <>
    <RuleLabel number="03" />
    <h2 className="font-serif italic" style={{ fontSize: 'clamp(48px, 9vw, 96px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05 }}>
      Design that <span style={{ color: '#FF3120' }}>solves.</span><br />Art that <span style={{ color: '#FF3120' }}>questions.</span>
    </h2>
    <p className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.08em', color: '#999999', maxWidth: '420px', lineHeight: 1.9, marginTop: '40px' }}>
      UX work grounded in research and empathy. Creative work that pushes further.
    </p>
    <div className="flex items-center" style={{ gap: '12px', marginTop: '48px' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#1f1f1f' }} />
      <span className="font-mono" style={{ fontSize: '9px', color: '#FF3120', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>SEE WORK ↓</span>
    </div>
  </>,
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const currentRef = useRef(0)
  const isAnimating = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)

  const advance = (dir: 'up' | 'down') => {
    if (isAnimating.current) return
    const next = dir === 'down'
      ? Math.min(currentRef.current + 1, TOTAL - 1)
      : Math.max(currentRef.current - 1, 0)
    if (next === currentRef.current) return
    currentRef.current = next
    isAnimating.current = true
    setCurrent(next)
    setTimeout(() => { isAnimating.current = false }, 750)
  }

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const container = containerRef.current
      if (!container) return
      // Only intercept while carousel is at the top of viewport
      if (container.getBoundingClientRect().top < -10) return

      const dir = e.deltaY > 0 ? 'down' : 'up'
      // At first stage scrolling up, or last stage scrolling down → let page scroll
      if (dir === 'up' && currentRef.current === 0) return
      if (dir === 'down' && currentRef.current === TOTAL - 1) return

      e.preventDefault()
      advance(dir)
    }

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return
      const deltaY = touchStartY.current - e.changedTouches[0].clientY
      touchStartY.current = null
      const container = containerRef.current
      if (!container || container.getBoundingClientRect().top < -10) return
      if (deltaY > 50) advance('down')
      else if (deltaY < -50) advance('up')
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, []) // stable — uses refs, no deps needed

  return (
    <div
      ref={containerRef}
      style={{
        height: 'calc(100vh - 73px)', // 73px = nav height (24px*2 padding + ~25px line-height)
        overflow: 'hidden',
        borderBottom: '1px solid #1f1f1f',
        position: 'relative',
      }}
    >
      {stageContent.map((content, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 40px',
            transform: i < current ? 'translateY(-100%)' : i === current ? 'translateY(0)' : 'translateY(100%)',
            opacity: i === current ? 1 : 0,
            transition: 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.35s ease',
          }}
        >
          {content}
        </div>
      ))}

      {/* Stage indicator dots */}
      <div
        style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '4px',
              height: i === current ? '20px' : '4px',
              borderRadius: '2px',
              backgroundColor: i === current ? '#FF3120' : '#2a2a2a',
              transition: 'height 0.4s ease, background-color 0.4s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'
import { RuleLabel } from './RuleLabel'

const TOTAL = 3

const stageContent = [
  // Stage 0
  <>
    <RuleLabel number="01" />
    <h1 className="font-serif" style={{ fontSize: 'var(--text-display)', fontWeight: 400, color: '#f5f2ed', lineHeight: 0.95 }}>
      <span style={{ color: '#FF3120' }}>Pramit</span><br />Ranjan
    </h1>
    <p className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.05em', color: '#999999', maxWidth: '500px', lineHeight: 1.9, marginTop: '44px' }}>
      UX design student at SCAD. Figuring out what good design can actually do.
    </p>
    <div className="font-mono select-none" style={{ position: 'absolute', right: '40px', bottom: '36px', fontSize: '9px', color: '#2a2a2a', letterSpacing: '0.14em' }}>
      SCROLL ↓
    </div>
  </>,

  // Stage 1
  <>
    <RuleLabel number="02" />
    <h2 className="font-serif" style={{ fontSize: 'var(--text-hero)', fontWeight: 400, fontStyle: 'italic', color: '#f5f2ed', lineHeight: 1.05 }}>
      From <span style={{ color: '#FF3120' }}>Film</span><br />to <span style={{ color: '#FF3120' }}>Figma.</span>
    </h2>
    <p className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.05em', color: '#999999', maxWidth: '500px', lineHeight: 1.9, marginTop: '44px' }}>
      A creative background shapes how I see problems. Photography, mixed media, and art — before Figma, before UX.
    </p>
  </>,

  // Stage 2
  <>
    <RuleLabel number="03" />
    <h2 className="font-serif" style={{ fontSize: 'var(--text-hero)', fontWeight: 400, fontStyle: 'italic', color: '#f5f2ed', lineHeight: 1.05 }}>
      Design that <span style={{ color: '#FF3120' }}>solves.</span><br />Art that <span style={{ color: '#FF3120' }}>questions.</span>
    </h2>
    <p className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.05em', color: '#999999', maxWidth: '500px', lineHeight: 1.9, marginTop: '44px' }}>
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
  // released = true means page can scroll freely (past stage 3)
  const releasedRef = useRef(false)
  const [released, setReleased] = useState(false)
  // readyToRelease becomes true after dwelling on stage 3 for 1.2s
  const readyToRelease = useRef(false)
  const touchStartY = useRef<number | null>(null)

  // Lock / unlock page scroll based on carousel state
  useEffect(() => {
    if (!released) {
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      // Hold scroll locked during collapse animation so momentum doesn't
      // carry past SelectedWork — matches friction of stage transitions
      window.scrollTo(0, 0)
      const t = setTimeout(() => { document.body.style.overflow = '' }, 380)
      return () => clearTimeout(t)
    }
    return () => { document.body.style.overflow = '' }
  }, [released])

  const advance = (dir: 'up' | 'down') => {
    if (isAnimating.current) return
    const next = dir === 'down'
      ? Math.min(currentRef.current + 1, TOTAL - 1)
      : Math.max(currentRef.current - 1, 0)
    if (next === currentRef.current) return
    currentRef.current = next
    isAnimating.current = true
    readyToRelease.current = false
    setCurrent(next)
    setTimeout(() => {
      isAnimating.current = false
      // Ready to release immediately after animation lands on last stage
      if (currentRef.current === TOTAL - 1) {
        readyToRelease.current = true
      }
    }, 900)
  }

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const dir = e.deltaY > 0 ? 'down' : 'up'

      if (!releasedRef.current) {
        // Carousel is locked — always stop page scroll
        e.preventDefault()

        if (dir === 'down' && currentRef.current === TOTAL - 1) {
          // Only release if dwell timer has elapsed
          if (!readyToRelease.current) return
          releasedRef.current = true
          setReleased(true)
          return
        }
        if (dir === 'up' && currentRef.current === 0) return // already at start
        advance(dir)
      } else {
        // Page scrolling freely — re-engage if user scrolls up at the very top
        if (dir === 'up' && window.scrollY === 0) {
          e.preventDefault()
          releasedRef.current = false
          setReleased(false)
          advance('up')
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      // Prevent iOS Safari from scrolling the page while carousel is locked
      if (!releasedRef.current) e.preventDefault()
    }

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      touchStartY.current = null

      if (!releasedRef.current) {
        if (delta > 50) {
          if (currentRef.current === TOTAL - 1) {
            if (!readyToRelease.current) return
            releasedRef.current = true
            setReleased(true)
          } else {
            advance('down')
          }
        } else if (delta < -50) {
          advance('up')
        }
      } else {
        if (delta < -50 && window.scrollY === 0) {
          releasedRef.current = false
          setReleased(false)
          advance('up')
        }
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, []) // stable — all state accessed via refs

  return (
    <div
      style={{
        height: released ? '0' : 'calc(100vh - 57px)',
        opacity: released ? 0 : 1,
        overflow: 'hidden',
        position: 'relative',
        transition: 'height 0.35s ease, opacity 0.25s ease',
      }}
    >
      {stageContent.map((content, i) => (
        <div
          key={i}
          className="hero-stage"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 40px',
            transform: i < current ? 'translateY(-100%)' : i === current ? 'translateY(0)' : 'translateY(100%)',
            opacity: i === current ? 1 : 0,
            transition: 'transform 0.85s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.4s ease',
          }}
        >
          {content}
        </div>
      ))}

    </div>
  )
}

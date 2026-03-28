'use client'
import { useEffect, useRef, useState } from 'react'
import { RuleLabel } from './RuleLabel'
import { useSiteCopy } from '@/components/SiteCopyProvider'

export function HeroCarousel() {
  const heroStages = useSiteCopy().home.heroStages
  const total = heroStages.length
  const [reducedMotion, setReducedMotion] = useState(false)
  const [current, setCurrent] = useState(0)
  const currentRef = useRef(0)
  const isAnimating = useRef(false)
  // released = true means page can scroll freely (past stage 3)
  const releasedRef = useRef(false)
  const [released, setReleased] = useState(false)
  // holdingRef stays true during the slide-out to absorb residual scroll input
  const holdingRef = useRef(false)
  // readyToRelease becomes true after animation lands on last stage
  const readyToRelease = useRef(false)
  const touchStartY = useRef<number | null>(null)
  // Track whether carousel has ever released so re-engagement doesn't re-hide main
  const hasReleasedRef = useRef(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // Add carousel-active class on mount so main starts off-screen
  useEffect(() => {
    document.body.classList.add('carousel-active')
    return () => {
      document.body.classList.remove('carousel-active')
      document.body.classList.remove('carousel-releasing')
      document.body.classList.remove('carousel-reengaging')
    }
  }, [])

  // Lock / unlock page scroll based on carousel state
  useEffect(() => {
    if (!released) {
      holdingRef.current = false
      document.body.classList.remove('carousel-releasing')
      if (!hasReleasedRef.current) {
        // Initial load: push main off-screen below
        document.body.classList.add('carousel-active')
      } else {
        // Re-engagement: main slides down as carousel slides in from above
        document.body.classList.add('carousel-reengaging')
        setTimeout(() => document.body.classList.remove('carousel-reengaging'), 900)
      }
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      hasReleasedRef.current = true
      document.body.classList.remove('carousel-active')
      window.scrollTo(0, 0)
      if (reducedMotion) {
        // Skip slide animation — unlock scroll immediately
        holdingRef.current = false
        document.body.style.overflow = ''
      } else {
        holdingRef.current = true
        document.body.classList.add('carousel-releasing')
        // Unlock after slide completes — same 900ms as stage transitions
        const t = setTimeout(() => {
          holdingRef.current = false
          document.body.classList.remove('carousel-releasing')
          document.body.style.overflow = ''
        }, 900)
        return () => clearTimeout(t)
      }
    }
    return () => { document.body.style.overflow = '' }
  }, [released])

  const advance = (dir: 'up' | 'down') => {
    if (isAnimating.current) return
    const next = dir === 'down'
      ? Math.min(currentRef.current + 1, total - 1)
      : Math.max(currentRef.current - 1, 0)
    if (next === currentRef.current) return
    currentRef.current = next
    isAnimating.current = true
    readyToRelease.current = false
    setCurrent(next)
    setTimeout(() => {
      isAnimating.current = false
      // Ready to release immediately after animation lands on last stage
      if (currentRef.current === total - 1) {
        readyToRelease.current = true
      }
    }, 900)
  }

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Absorb trackpad momentum during hold period after carousel release
      if (holdingRef.current) { e.preventDefault(); return }

      const dir = e.deltaY > 0 ? 'down' : 'up'

      if (!releasedRef.current) {
        // Carousel is locked — always stop page scroll
        e.preventDefault()

        if (dir === 'down' && currentRef.current === total - 1) {
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
          // Lock for slide-in duration — no stage advance, carousel restores at stage 3
          isAnimating.current = true
          setTimeout(() => { isAnimating.current = false }, 900)
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      // Block touch scroll while carousel is active OR during momentum hold after release
      if (!releasedRef.current || holdingRef.current) e.preventDefault()
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
          if (currentRef.current === total - 1) {
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
          isAnimating.current = true
          setTimeout(() => { isAnimating.current = false }, 900)
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
  }, [total]) // stable refs plus stage count

  return (
    <div
      className="hero-carousel-container"
      style={{
        position: 'fixed',
        top: '57px',
        left: 0,
        right: 0,
        height: 'calc(100vh - 57px)',
        overflow: 'hidden',
        zIndex: 10,
        transform: released ? 'translateY(-100%)' : 'translateY(0)',
        transition: reducedMotion ? 'none' : 'transform 0.85s cubic-bezier(0.77, 0, 0.175, 1)',
        backgroundColor: '#0d0d0d',
      }}
    >
      {heroStages.map((stage, i) => (
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
            transition: reducedMotion ? 'none' : 'transform 0.85s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.4s ease',
          }}
        >
          <RuleLabel number={stage.number} />
          {i === 0 ? (
            <h1
              className="font-serif"
              style={{ fontSize: 'var(--text-display)', fontWeight: 400, color: '#f5f2ed', lineHeight: 0.95 }}
              dangerouslySetInnerHTML={{ __html: stage.titleHtml }}
            />
          ) : (
            <h2
              className="font-serif"
              style={{ fontSize: 'var(--text-hero)', fontWeight: 400, fontStyle: 'italic', color: '#f5f2ed', lineHeight: 1.05 }}
              dangerouslySetInnerHTML={{ __html: stage.titleHtml }}
            />
          )}
          <p className="font-mono" style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.05em', color: '#999999', maxWidth: '500px', lineHeight: 1.9, marginTop: '44px' }}>
            {stage.body}
          </p>
          {stage.footerLabel ? (
            i === 0 ? (
              <div className="font-mono select-none" style={{ position: 'absolute', right: '40px', bottom: '36px', fontSize: '9px', color: '#2a2a2a', letterSpacing: '0.14em' }}>
                {stage.footerLabel}
              </div>
            ) : (
              <div className="flex items-center" style={{ gap: '12px', marginTop: '48px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#1f1f1f' }} />
                <span className="font-mono" style={{ fontSize: '9px', color: '#FF3120', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>
                  {stage.footerLabel}
                </span>
              </div>
            )
          ) : null}
        </div>
      ))}

    </div>
  )
}

'use client'

import { useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { EditorialMediaItem } from '@/lib/site-content-schema'

type CarouselItem = EditorialMediaItem & {
  src: string
  carouselLabel: string
}

export function EditorialVideoCarousel({ items }: { items: CarouselItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [pointerHeld, setPointerHeld] = useState(false)
  const [focusHeld, setFocusHeld] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const swipeConsumedRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const activeItem = items[activeIndex]
  const rotationHeld = pointerHeld || focusHeld

  const positionFor = (index: number) => {
    if (index === activeIndex) return 'current'
    if (index === (activeIndex - 1 + items.length) % items.length) return 'previous'
    if (index === (activeIndex + 1) % items.length) return 'next'
    return 'hidden'
  }

  const selectSlide = useCallback((index: number) => {
    setUserPaused(false)
    setActiveIndex((index + items.length) % items.length)
  }, [items.length])

  const advance = useCallback(() => {
    selectSlide(activeIndex + 1)
  }, [activeIndex, selectSlide])

  const beginSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return
    swipeStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const endSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current
    swipeStartRef.current = null
    if (!start || event.pointerType !== 'touch') return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY)) return

    swipeConsumedRef.current = true
    window.setTimeout(() => {
      swipeConsumedRef.current = false
    }, 0)
    selectSlide(activeIndex + (deltaX < 0 ? 1 : -1))
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    rootRef.current?.querySelectorAll('video').forEach((candidate) => {
      if (candidate !== video) candidate.pause()
    })

    if (reducedMotion || !inView || userPaused) {
      video.pause()
      return
    }

    void video.play().catch(() => setUserPaused(true))
  }, [activeIndex, inView, reducedMotion, userPaused])

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      setUserPaused(false)
      try {
        await video.play()
      } catch {
        setUserPaused(true)
      }
    } else {
      video.pause()
      setUserPaused(true)
    }
  }

  return (
    <div className="editorial-video-carousel-wrap">
      <div
        ref={rootRef}
        className="editorial-video-carousel"
        aria-roledescription="carousel"
        aria-label="Solution videos"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setPointerHeld(true)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'mouse') return
          setPointerHeld(false)
          if (!focusHeld && videoRef.current?.ended && !reducedMotion) advance()
        }}
        onFocus={() => setFocusHeld(true)}
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
          setFocusHeld(false)
          if (!pointerHeld && videoRef.current?.ended && !reducedMotion) advance()
        }}
      >
        <div
          className="editorial-video-carousel-stage"
          onPointerDown={beginSwipe}
          onPointerUp={endSwipe}
          onPointerCancel={() => {
            swipeStartRef.current = null
          }}
        >
          {items.map((item, index) => {
            const position = positionFor(index)
            const current = position === 'current'

            return (
              <div
                key={item.id}
                className="editorial-video-carousel-slide"
                data-position={position}
                style={{ '--slide-aspect': item.aspectRatio ?? '9 / 16' } as CSSProperties}
                aria-hidden={!current}
              >
                <video
                  ref={current ? videoRef : undefined}
                  src={item.src}
                  poster={item.poster}
                  muted
                  playsInline
                  preload={current ? 'auto' : 'metadata'}
                  tabIndex={current ? 0 : -1}
                  role={current ? 'button' : undefined}
                  aria-label={current ? `${userPaused ? 'Play' : 'Pause'} video: ${item.alt || item.carouselLabel}` : undefined}
                  onClick={current ? () => {
                    if (swipeConsumedRef.current) return
                    void togglePlayback()
                  } : undefined}
                  onKeyDown={(event) => {
                    if (!current) return
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    void togglePlayback()
                  }}
                  onEnded={() => {
                    if (!current) return
                    if (!rotationHeld && !reducedMotion) advance()
                  }}
                  onPlay={current ? () => setUserPaused(false) : undefined}
                  style={{ objectFit: item.fit ?? 'cover' }}
                />
              </div>
            )
          })}
        </div>

        <div className="editorial-video-carousel-meta">
          <div aria-live="polite">
            <span className="font-mono">NOW PLAYING</span>
          </div>
        </div>

        <div className="editorial-video-carousel-tabs" role="tablist" aria-label="Choose solution video">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              data-active={index === activeIndex || undefined}
              onClick={() => selectSlide(index)}
            >
              <span className="font-mono">{item.carouselLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

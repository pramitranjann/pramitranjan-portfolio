'use client'

import Image from 'next/image'
import Link from 'next/link'
import { animate, motion, motionValue, useReducedMotion } from 'motion/react'
import { useRouter } from 'next/navigation'
import type { MotionValue } from 'motion/react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { TransitionRail } from './TransitionRail'
import type { PortfolioCarouselContent, PortfolioCarouselItem } from '@/lib/site-content-schema'
import styles from './PortfolioHero.module.css'

const CAROUSEL_TRANSITION_MS = 560
const SWIPE_VELOCITY_THRESHOLD = 0.45
const SWIPE_MIN_VELOCITY_DISTANCE = 18

type CarouselGesture = {
  pointerId: number
  cardIndex: number
  startX: number
  startY: number
  lastX: number
  lastTime: number
  velocityX: number
  width: number
  axis: 'pending' | 'horizontal' | 'vertical'
}

export function PortfolioCarousel({
  items,
  heading,
  headingId,
}: {
  items: PortfolioCarouselItem[]
  heading: PortfolioCarouselContent['heading']
  headingId?: string
}) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(1)
  const [oppositeSide, setOppositeSide] = useState<'before' | 'after'>('after')
  const [instantPositioning, setInstantPositioning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const reducedMotion = useReducedMotion()
  const animatingRef = useRef(false)
  const swipeSettlingRef = useRef(false)
  const resetTimerRef = useRef<number | null>(null)
  const clickResetTimerRef = useRef<number | null>(null)
  const dragAnimationRef = useRef<ReturnType<typeof animate> | null>(null)
  const suppressClickRef = useRef(false)
  const gestureRef = useRef<CarouselGesture | null>(null)
  const dragValuesRef = useRef<MotionValue<number>[] | null>(null)
  if (dragValuesRef.current === null) {
    dragValuesRef.current = items.map(() => motionValue(0))
  }
  const dragValues = dragValuesRef.current
  const featureCount = items.length
  const previousIndex = (activeIndex - 1 + featureCount) % featureCount
  const nextIndex = (activeIndex + 1) % featureCount

  useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current)
    if (clickResetTimerRef.current !== null) window.clearTimeout(clickResetTimerRef.current)
    dragAnimationRef.current?.stop()
  }, [])

  const moveCarousel = (direction: 'previous' | 'next') => {
    if (animatingRef.current) return

    const requiredStartSide = direction === 'next' ? 'after' : 'before'
    const transitionEndSide = direction === 'next' ? 'before' : 'after'

    const startTransition = () => {
      animatingRef.current = true
      setActiveIndex((index) => (
        direction === 'next'
          ? (index + 1) % featureCount
          : (index - 1 + featureCount) % featureCount
      ))
      setOppositeSide(transitionEndSide)

      resetTimerRef.current = window.setTimeout(() => {
        setInstantPositioning(true)
        setOppositeSide(requiredStartSide)
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setInstantPositioning(false)
            animatingRef.current = false
          })
        })
      }, CAROUSEL_TRANSITION_MS)
    }

    if (oppositeSide === requiredStartSide) {
      startTransition()
      return
    }

    setInstantPositioning(true)
    setOppositeSide(requiredStartSide)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setInstantPositioning(false)
        window.requestAnimationFrame(startTransition)
      })
    })
  }

  const startSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === 'mouse'
      || !event.isPrimary
      || animatingRef.current
      || swipeSettlingRef.current
    ) return

    dragAnimationRef.current?.stop()
    setDraggedIndex(activeIndex)
    gestureRef.current = {
      pointerId: event.pointerId,
      cardIndex: activeIndex,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocityX: 0,
      width: event.currentTarget.getBoundingClientRect().width,
      axis: 'pending',
    }
  }

  const updateSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    const deltaX = event.clientX - gesture.startX
    const deltaY = event.clientY - gesture.startY

    if (gesture.axis === 'pending') {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        gesture.axis = 'vertical'
        return
      }

      gesture.axis = 'horizontal'
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    if (gesture.axis !== 'horizontal') return

    event.preventDefault()
    const elapsed = Math.max(1, event.timeStamp - gesture.lastTime)
    const velocity = (event.clientX - gesture.lastX) / elapsed
    gesture.velocityX = gesture.velocityX * 0.55 + velocity * 0.45
    gesture.lastX = event.clientX
    gesture.lastTime = event.timeStamp

    const maxDrag = Math.min(96, gesture.width * 0.26)
    dragValues[gesture.cardIndex].set(Math.max(-maxDrag, Math.min(maxDrag, deltaX)))
  }

  const finishSwipe = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const deltaX = event.clientX - gesture.startX
    const velocityX = event.timeStamp - gesture.lastTime > 80 ? 0 : gesture.velocityX
    const wasHorizontal = gesture.axis === 'horizontal'
    const dragValue = dragValues[gesture.cardIndex]

    if (!wasHorizontal) {
      setIsDragging(false)
      setDraggedIndex(null)
      return
    }

    if (cancelled) {
      if (reducedMotion) {
        dragValue.set(0)
        setIsDragging(false)
        setDraggedIndex(null)
        return
      }

      dragAnimationRef.current = animate(dragValue, 0, {
        type: 'spring',
        stiffness: 520,
        damping: 40,
        mass: 0.55,
      })
      dragAnimationRef.current.then(() => {
        setIsDragging(false)
        setDraggedIndex(null)
      })
      return
    }

    suppressClickRef.current = true
    clickResetTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false
      clickResetTimerRef.current = null
    }, 400)

    const distanceThreshold = Math.min(64, gesture.width * 0.16)
    const passedDistance = Math.abs(deltaX) >= distanceThreshold
    const passedVelocity = Math.abs(deltaX) >= SWIPE_MIN_VELOCITY_DISTANCE
      && Math.abs(velocityX) >= SWIPE_VELOCITY_THRESHOLD

    if (passedDistance || passedVelocity) {
      const direction = deltaX < 0 ? 'next' : 'previous'

      swipeSettlingRef.current = true
      if (reducedMotion) {
        dragValue.set(0)
        setIsDragging(false)
        setDraggedIndex(null)
        swipeSettlingRef.current = false
        moveCarousel(direction)
        return
      }

      // Change the card roles and settle the finger offset in the same frame.
      // A separate release throw made the card switch coordinate systems midway
      // through the gesture, which read as a jump on mobile Safari.
      setIsDragging(false)
      moveCarousel(direction)
      dragAnimationRef.current = animate(dragValue, 0, {
        type: 'spring',
        stiffness: 390,
        damping: 38,
        mass: 0.62,
        velocity: Math.max(-900, Math.min(900, velocityX * 1000)),
      })
      dragAnimationRef.current.then(() => {
        setDraggedIndex(null)
        swipeSettlingRef.current = false
      })
      return
    }

    if (reducedMotion) {
      dragValue.set(0)
      setIsDragging(false)
      setDraggedIndex(null)
      return
    }

    dragAnimationRef.current = animate(dragValue, 0, {
      type: 'spring',
      stiffness: 520,
      damping: 40,
      mass: 0.55,
    })
    dragAnimationRef.current.then(() => {
      setIsDragging(false)
      setDraggedIndex(null)
    })
  }

  return (
    <div className={styles.layout}>
      <h1
        id={headingId}
        className={`${styles.headline} font-serif`}
        style={heading.headlineSize ? ({ '--hero-headline-size': heading.headlineSize } as CSSProperties) : undefined}
      >
        {heading.lead}<em>{heading.emphasis}</em>
      </h1>

      <div
        className={styles.showcase}
        data-instant={instantPositioning}
        data-dragging={isDragging}
        role="group"
        aria-roledescription="carousel"
        aria-label="Portfolio highlights"
        onPointerDown={startSwipe}
        onPointerMove={updateSwipe}
        onPointerUp={(event) => finishSwipe(event)}
        onPointerCancel={(event) => finishSwipe(event, true)}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return
          event.preventDefault()
          event.stopPropagation()
          suppressClickRef.current = false
          if (clickResetTimerRef.current !== null) window.clearTimeout(clickResetTimerRef.current)
          clickResetTimerRef.current = null
        }}
      >
        <div className={styles.stage}>
          {items.map((feature, index) => {
            const position = index === activeIndex
              ? 'current'
              : index === previousIndex
                ? 'previous'
                : index === nextIndex
                  ? 'next'
                  : oppositeSide
            const isCurrent = position === 'current'
            const isHidden = position === 'before' || position === 'after'

            return (
              <motion.button
                key={feature.label}
                type="button"
                className={styles.card}
                data-position={position}
                style={draggedIndex === index ? { x: dragValues[index] } : undefined}
                tabIndex={isHidden ? -1 : 0}
                aria-hidden={isHidden}
                aria-label={isCurrent ? `Open ${feature.label}` : `Show ${feature.label} in the centre`}
                onClick={() => {
                  if (isCurrent) {
                    router.push(feature.href)
                    return
                  }
                  if (position === 'previous' || position === 'next') moveCarousel(position)
                }}
              >
                <span
                  className={styles.image}
                  aria-hidden="true"
                  style={{ background: feature.imageBackground }}
                >
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    priority={index < 2}
                    /* Screens and detailed visual work should not be passed
                       through another resampling step before this hero paints. */
                    unoptimized
                    sizes="(max-width: 767px) 62vw, 720px"
                    style={{ objectFit: feature.imageFit, objectPosition: feature.imagePosition }}
                  />
                </span>
                <span className={styles.copy}>
                  <span className={`${styles.label} font-mono`}>{feature.label}</span>
                  <span className={`${styles.title} font-serif`}>{feature.title}</span>
                  <span className={`${styles.description} font-reading`}>{feature.description}</span>
                  <span className={`${styles.open} font-mono`}>OPEN ↗</span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function PortfolioHero({ content }: { content: PortfolioCarouselContent }) {
  return (
    <section className={styles.hero} aria-labelledby="portfolio-hero-title">
      <div className={styles.shell}>
        <PortfolioCarousel
          items={content.items}
          heading={content.heading}
          headingId="portfolio-hero-title"
        />
        <Link className={styles.transition} href="#selected-work" aria-label="Continue to selected work">
          <TransitionRail className={styles.transitionTrack} />
        </Link>
      </div>
    </section>
  )
}

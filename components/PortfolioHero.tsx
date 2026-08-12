'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { TransitionRail } from './TransitionRail'
import styles from './PortfolioHero.module.css'

const carouselFeatures = [
  {
    label: 'About',
    title: 'Camera before Figma.',
    description: 'A third-culture kid who still thinks in frames.',
    href: '/about',
    image: '/creative/photography/kl/41.jpg',
    imageFit: 'cover',
    imagePosition: 'center',
    imageBackground: '#111111',
  },
  {
    label: 'UX work',
    title: 'Research to resolution.',
    description: 'Franklin’s · Reframing a Savannah institution’s digital front door.',
    href: '/work/franklins',
    image: '/work/franklins/Home Page.png',
    imageFit: 'contain',
    imagePosition: 'center',
    imageBackground: '#f5f2ed',
  },
  {
    label: 'Photography',
    title: 'Always looking.',
    description: 'Ho Chi Minh City · Motion, heat and the street.',
    href: '/play/photography/hcmc',
    image: '/creative/photography/hcmc/14.jpg',
    imageFit: 'cover',
    imagePosition: 'center',
    imageBackground: '#111111',
  },
  {
    label: 'Mixed media',
    title: 'Beyond the screen.',
    description: 'South China Sea · Cyanotypes, photograms and a seven-foot detective board.',
    href: '/play/mixed-media/south-china-sea',
    image: '/creative/mixed-media/south-china-sea/solution-2.png',
    imageFit: 'contain',
    imagePosition: 'center',
    imageBackground: '#060606',
  },
] as const

const CAROUSEL_TRANSITION_MS = 560

export function PortfolioCarousel({ headingId }: { headingId?: string }) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(1)
  const [oppositeSide, setOppositeSide] = useState<'before' | 'after'>('after')
  const [instantPositioning, setInstantPositioning] = useState(false)
  const animatingRef = useRef(false)
  const resetTimerRef = useRef<number | null>(null)
  const featureCount = carouselFeatures.length
  const previousIndex = (activeIndex - 1 + featureCount) % featureCount
  const nextIndex = (activeIndex + 1) % featureCount

  useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current)
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

  return (
    <div className={styles.layout}>
      <h1 id={headingId} className={`${styles.headline} font-serif`}>
        Hello, I&apos;m Pramit—<em>a UX designer who builds the work.</em>
      </h1>

      <div
        className={styles.showcase}
        data-instant={instantPositioning}
        role="group"
        aria-roledescription="carousel"
        aria-label="Portfolio highlights"
      >
        <div className={styles.stage}>
          {carouselFeatures.map((feature, index) => {
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
              <button
                key={feature.label}
                type="button"
                className={styles.card}
                data-position={position}
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
                    sizes="(max-width: 767px) 52vw, 31vw"
                    style={{ objectFit: feature.imageFit, objectPosition: feature.imagePosition }}
                  />
                </span>
                <span className={styles.copy}>
                  <span className={`${styles.label} font-mono`}>{feature.label}</span>
                  <span className={`${styles.title} font-serif`}>{feature.title}</span>
                  <span className={`${styles.description} font-reading`}>{feature.description}</span>
                  <span className={`${styles.open} font-mono`}>OPEN ↗</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function PortfolioHero() {
  return (
    <section className={styles.hero} aria-labelledby="portfolio-hero-title">
      <div className={styles.shell}>
        <PortfolioCarousel headingId="portfolio-hero-title" />
        <Link className={styles.transition} href="#selected-work" aria-label="Continue to selected work">
          <TransitionRail className={styles.transitionTrack} />
        </Link>
      </div>
    </section>
  )
}

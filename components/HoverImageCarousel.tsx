'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { crossfadeLayer } from '@/lib/crossfade-layer'

const ROTATE_MS = 1350
const STAGGER_MS = 400
const HOVER_DELAY_MS = 380
const FADE_MS = 600

export function HoverImageCarousel({
  images,
  alt,
  imageFit = 'cover',
  imagePosition = 'center',
  imageScale = '1',
  sizes,
  hovered,
  ambientIndex,
  priorityFirstFrame = false,
}: {
  images?: string[]
  alt: string
  imageFit?: 'contain' | 'cover'
  imagePosition?: string
  imageScale?: string
  sizes: string
  hovered: boolean
  /* Opt into ambient rotation: the card cycles at rest instead of waiting for hover.
     The number is the card's position in its grid, used to offset its start so the
     wall shimmers unevenly rather than flipping on one beat. Undefined keeps the
     original hover-gated behaviour (work page, section indexes). */
  ambientIndex?: number
  priorityFirstFrame?: boolean
}) {
  const frames = useMemo(() => Array.from(new Set((images ?? []).filter(Boolean))), [images])
  const [brokenImages, setBrokenImages] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rotateTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const visibleFrames = useMemo(() => frames.filter((image) => !brokenImages.includes(image)), [frames, brokenImages])

  useEffect(() => {
    setBrokenImages([])
  }, [frames])

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const ambient = ambientIndex !== undefined && !reducedMotion

  const rotate = (delay: number) => {
    startTimer.current = setTimeout(() => {
      setActiveIndex(1)
      rotateTimer.current = setInterval(() => {
        setActiveIndex((current) => (current + 1) % visibleFrames.length)
      }, ROTATE_MS)
    }, delay)

    return () => {
      if (startTimer.current) clearTimeout(startTimer.current)
      if (rotateTimer.current) clearInterval(rotateTimer.current)
    }
  }

  // Ambient: runs once on mount and never restarts, so hovering cannot reset the phase.
  useEffect(() => {
    if (!ambient || visibleFrames.length <= 1) return
    // Hold the first frame for a full beat before the offset, so card 0 does not flip on arrival.
    return rotate(ROTATE_MS + (ambientIndex ?? 0) * STAGGER_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Keyed on length, not the array: a parent re-render that hands us a fresh
    // images array must not restart the rotation and reset the phase.
  }, [visibleFrames.length, ambient, ambientIndex])

  // Hover-gated: the original behaviour, still used wherever ambientIndex is not passed.
  useEffect(() => {
    if (ambient || typeof window === 'undefined' || visibleFrames.length <= 1) return
    if (!hovered) {
      if (startTimer.current) clearTimeout(startTimer.current)
      if (rotateTimer.current) clearInterval(rotateTimer.current)
      setActiveIndex(0)
      return
    }

    return rotate(HOVER_DELAY_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleFrames, hovered, ambient])

  /* The last frame to finish its dissolve. While it trails activeIndex it is the frame
     being dissolved away from, and it must be state rather than a ref: it has to be
     correct on the very render where activeIndex changes, or the outgoing frame blinks
     to transparent for one frame before an effect can restore it. */
  const [settledIndex, setSettledIndex] = useState(0)

  useEffect(() => {
    if (settledIndex === activeIndex) return
    const settle = setTimeout(() => setSettledIndex(activeIndex), FADE_MS)
    return () => clearTimeout(settle)
  }, [activeIndex, settledIndex])

  useEffect(() => {
    if (!visibleFrames.length) {
      setActiveIndex(0)
      return
    }

    if (activeIndex > visibleFrames.length - 1) {
      setActiveIndex(0)
    }
  }, [activeIndex, visibleFrames.length])

  if (!visibleFrames.length) {
    return null
  }

  return (
    <>
      {visibleFrames.map((image, index) => (
        <span
          key={image}
          className="card-media-frame"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            backgroundColor: 'inherit',
            ...crossfadeLayer(index, activeIndex, settledIndex),
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        >
          <Image
            src={image}
            alt={alt}
            fill
            className="card-media-image"
            sizes={sizes}
            priority={priorityFirstFrame && index === 0}
            onError={() => {
              setBrokenImages((current) => (current.includes(image) ? current : [...current, image]))
            }}
            style={{
              objectFit: imageFit,
              objectPosition: imagePosition,
              transform: `scale(${imageScale})`,
              transition: 'transform 240ms ease-out',
            }}
          />
        </span>
      ))}
    </>
  )
}

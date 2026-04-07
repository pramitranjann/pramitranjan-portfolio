'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

export function HoverImageCarousel({
  images,
  alt,
  imageFit = 'cover',
  imagePosition = 'center',
  sizes,
  hovered,
}: {
  images?: string[]
  alt: string
  imageFit?: 'contain' | 'cover'
  imagePosition?: string
  sizes: string
  hovered: boolean
}) {
  const frames = useMemo(() => Array.from(new Set((images ?? []).filter(Boolean))), [images])
  const [brokenImages, setBrokenImages] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rotateTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const visibleFrames = useMemo(() => frames.filter((image) => !brokenImages.includes(image)), [frames, brokenImages])

  useEffect(() => {
    setBrokenImages([])
  }, [frames])

  useEffect(() => {
    if (typeof window === 'undefined' || visibleFrames.length <= 1) return
    if (!hovered) {
      if (startTimer.current) clearTimeout(startTimer.current)
      if (rotateTimer.current) clearInterval(rotateTimer.current)
      setActiveIndex(0)
      return
    }

    visibleFrames.slice(1).forEach((image) => {
      const preload = new window.Image()
      preload.src = image
    })

    startTimer.current = setTimeout(() => {
      setActiveIndex(1)
      rotateTimer.current = setInterval(() => {
        setActiveIndex((current) => (current + 1) % visibleFrames.length)
      }, 1350)
    }, 380)

    return () => {
      if (startTimer.current) clearTimeout(startTimer.current)
      if (rotateTimer.current) clearInterval(rotateTimer.current)
    }
  }, [visibleFrames, hovered])

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
        <Image
          key={image}
          src={image}
          alt={alt}
          fill
          sizes={sizes}
          onError={() => {
            setBrokenImages((current) => (current.includes(image) ? current : [...current, image]))
          }}
          style={{
            objectFit: imageFit,
            objectPosition: imagePosition,
            opacity: index === activeIndex ? 1 : 0,
            transition: 'opacity 240ms ease-out',
          }}
        />
      ))}
    </>
  )
}

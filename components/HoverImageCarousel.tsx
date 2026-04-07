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
  const [activeIndex, setActiveIndex] = useState(0)
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rotateTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || frames.length <= 1) return
    if (!hovered) {
      if (startTimer.current) clearTimeout(startTimer.current)
      if (rotateTimer.current) clearInterval(rotateTimer.current)
      setActiveIndex(0)
      return
    }

    frames.slice(1).forEach((image) => {
      const preload = new window.Image()
      preload.src = image
    })

    startTimer.current = setTimeout(() => {
      setActiveIndex(1)
      rotateTimer.current = setInterval(() => {
        setActiveIndex((current) => (current + 1) % frames.length)
      }, 1350)
    }, 380)

    return () => {
      if (startTimer.current) clearTimeout(startTimer.current)
      if (rotateTimer.current) clearInterval(rotateTimer.current)
    }
  }, [frames, hovered])

  if (!frames.length) {
    return null
  }

  return (
    <>
      {frames.map((image, index) => (
        <Image
          key={image}
          src={image}
          alt={alt}
          fill
          sizes={sizes}
          style={{
            objectFit: imageFit,
            objectPosition: imagePosition,
            opacity: index === activeIndex ? 1 : 0,
            transition: 'opacity 220ms ease-out',
          }}
        />
      ))}
    </>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

export function EditorialMediaVideo({
  src,
  poster,
  alt,
  fit = 'cover',
}: {
  src: string
  poster?: string
  alt?: string
  fit?: 'contain' | 'cover'
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!video || !reducedMotion.matches) return

    video.pause()
  }, [])

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      try {
        await video.play()
      } catch {
        setPaused(true)
      }
    } else {
      video.pause()
    }
  }

  const action = paused ? 'Play' : 'Pause'
  const description = alt || 'Case study video'

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      tabIndex={0}
      role="button"
      aria-label={`${action} video: ${description}`}
      onClick={togglePlayback}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        void togglePlayback()
      }}
      onPlay={() => setPaused(false)}
      onPause={() => setPaused(true)}
      style={{ objectFit: fit }}
    />
  )
}

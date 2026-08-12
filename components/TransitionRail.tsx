'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import styles from './TransitionRail.module.css'

interface TransitionRailProps {
  className?: string
  style?: CSSProperties
}

export function TransitionRail({ className, style }: TransitionRailProps) {
  const trackRef = useRef<HTMLSpanElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    if (!('IntersectionObserver' in window)) {
      setIsActive(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setIsActive(true)
      observer.disconnect()
    }, { threshold: 0.15 })

    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  return (
    <span
      ref={trackRef}
      className={`${styles.track}${className ? ` ${className}` : ''}`}
      data-active={isActive}
      style={style}
      aria-hidden="true"
    >
      <span className={styles.runner} />
    </span>
  )
}

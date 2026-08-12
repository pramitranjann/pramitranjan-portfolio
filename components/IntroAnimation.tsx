'use client'

import { useEffect, useRef, useState } from 'react'
import { playIntroKey, playIntroLift } from '@/lib/sounds'
import styles from './IntroAnimation.module.css'

let played = false

export function IntroAnimation({
  forcePlay = false,
  onComplete,
}: {
  forcePlay?: boolean
  onComplete?: () => void
}) {
  const [done, setDone] = useState(() => played && !forcePlay)
  const [leaving, setLeaving] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const finish = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (!forcePlay) played = true
    setDone(true)
    onCompleteRef.current?.()
  }

  useEffect(() => {
    if (played && !forcePlay) {
      setDone(true)
      onCompleteRef.current?.()
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!forcePlay) played = true
      setDone(true)
      onCompleteRef.current?.()
      return
    }

    timersRef.current = [
      setTimeout(() => playIntroKey('P'), 0),
      setTimeout(() => playIntroKey('R'), 150),
      setTimeout(() => {
        setLeaving(true)
        playIntroLift()
      }, 760),
      setTimeout(() => {
        if (!forcePlay) played = true
        setDone(true)
        onCompleteRef.current?.()
      }, 1400),
    ]

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [forcePlay])

  if (done) return null

  return (
    <button
      type="button"
      className={styles.intro}
      data-leaving={leaving}
      aria-label="Skip PR intro"
      onClick={finish}
    >
      <span className={`${styles.mark} font-mono`} aria-hidden="true">
        <span>P</span>
        <span>R</span>
      </span>
      <span className={`${styles.skip} font-mono`}>CLICK TO SKIP</span>
    </button>
  )
}

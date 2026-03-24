// components/GsapReveal.tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionSettings } from '@/components/MotionSettingsProvider'

gsap.registerPlugin(ScrollTrigger)

interface GsapRevealProps {
  children: React.ReactNode
  stagger?: number
  className?: string
  style?: React.CSSProperties
}

export function GsapReveal({ children, stagger = 0.08, className, style }: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const motion = useMotionSettings()
  const staggerRef = useRef(stagger)
  staggerRef.current = stagger

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const items = el.querySelectorAll(':scope > [data-reveal]')
    if (items.length === 0) return () => {}

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ctx = gsap.context(() => {
        gsap.set(items, { opacity: 1, y: 0 })
      }, el)
      return () => ctx.revert()
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: motion.pageRevealDistance })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: motion.pageRevealDuration,
            ease: 'power2.out',
            stagger: stagger === 0.08 ? motion.pageRevealStagger : staggerRef.current,
          })
        },
        once: true,
      })
    }, el)

    return () => ctx.revert()
  }, [motion.pageRevealDistance, motion.pageRevealDuration, motion.pageRevealStagger, stagger])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}

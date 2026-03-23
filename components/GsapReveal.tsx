// components/GsapReveal.tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface GsapRevealProps {
  children: React.ReactNode
  stagger?: number
  className?: string
  style?: React.CSSProperties
}

export function GsapReveal({ children, stagger = 0.08, className, style }: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const el = ref.current
    if (!el) return

    const items = el.querySelectorAll('[data-reveal]')
    if (items.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ctx = gsap.context(() => {
        gsap.set(items, { opacity: 1, y: 0 })
      }, el)
      return () => ctx.revert()
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 16 })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger,
          })
        },
        once: true,
      })
    }, el)

    return () => ctx.revert()
  }, [stagger])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}

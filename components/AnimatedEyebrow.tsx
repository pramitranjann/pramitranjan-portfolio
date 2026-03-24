'use client'

import { useEffect, useRef } from 'react'

export function AnimatedEyebrow({
  label,
  color = '#FF3120',
  marginBottom = '24px',
}: {
  label: string
  color?: string
  marginBottom?: string
}) {
  const eyebrowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = eyebrowRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('eyebrow-animate')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom }}>
      <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: color }} />
      <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color }}>
        {label}
      </span>
    </div>
  )
}

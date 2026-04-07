'use client'
import { useEffect, useRef } from 'react'
import { useMotionSettings } from '@/components/MotionSettingsProvider'
import { useSiteCopy } from '@/components/SiteCopyProvider'

export function Contact() {
  const secRef = useRef<HTMLElement>(null)
  const motion = useMotionSettings()
  const copy = useSiteCopy().home

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(el.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * motion.simpleRevealStagger * 1000))
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [motion.simpleRevealStagger])

  return (
    <section
      ref={secRef}
      style={{ borderTop: '1px solid #1f1f1f', padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)', textAlign: 'center' }}
    >
      <div
        className="reveal-text font-serif italic"
        style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: 'var(--color-heading)', lineHeight: 1.1 }}
      >
        {copy.contactTitle}
      </div>
      <div
        className="reveal-text font-serif italic"
        style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: 'var(--color-red)', lineHeight: 1.1, marginBottom: '40px' }}
      >
        {copy.contactAccent}
      </div>

      <div className="reveal-text flex justify-center" style={{ gap: '28px' }}>
        {copy.contactLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link font-mono"
            style={{
              fontSize: 'var(--text-meta)',
              letterSpacing: '0.14em',
              paddingBottom: '2px',
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}

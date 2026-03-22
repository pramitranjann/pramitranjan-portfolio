'use client'
import { useEffect, useRef } from 'react'

const socialLinks = [
  { label: 'LINKEDIN',  href: 'https://www.linkedin.com/in/pramitranjann/' },
  { label: 'GMAIL',     href: 'mailto:pramit@pramitranjann.com' },
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/pramitranjann/' },
]

export function Contact() {
  const secRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(el.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * 200))
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={secRef}
      style={{ borderTop: '1px solid #1f1f1f', padding: '32px 24px', textAlign: 'center' }}
    >
      <div
        className="reveal-text font-serif italic"
        style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
      >
        You made it this far.
      </div>
      <div
        className="reveal-text font-serif italic"
        style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 400, color: '#FF3120', lineHeight: 1.1, marginBottom: '40px' }}
      >
        Say hello.
      </div>

      <div className="reveal-text flex justify-center" style={{ gap: '28px' }}>
        {socialLinks.map(({ label, href }) => (
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

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
      style={{ borderTop: '1px solid #1f1f1f', padding: '48px 24px' }}
    >
      <h2
        className="reveal-text font-serif italic"
        style={{ fontSize: '38px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '24px' }}
      >
        You made it<br />this far.<br /><span style={{ color: '#FF3120' }}>Say hello.</span>
      </h2>

      <div className="reveal-text flex" style={{ gap: '20px' }}>
        {socialLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="font-mono"
            style={{
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: '#888888',
              textDecoration: 'none',
              borderBottom: '1px solid #FF3120',
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

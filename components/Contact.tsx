'use client'
import { useEffect, useRef } from 'react'

const socialLinks = [
  { label: 'LINKEDIN',  href: 'https://linkedin.com/in/pramitranjan' },
  { label: 'GMAIL',     href: 'mailto:pramit@pramitranjan.com' },
  { label: 'INSTAGRAM', href: 'https://instagram.com/pramitranjan' },
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
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * 300))
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
      className="border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      <h2
        className="reveal-text font-serif italic"
        style={{ fontSize: '38px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
      >
        You made it this far.{' '}
        <span style={{ color: '#FF3120' }}>Say hello.</span>
      </h2>
      <div className="reveal-text flex gap-6 mt-8">
        {socialLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="font-mono"
            style={{
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: '#f5f2ed',
              textDecoration: 'underline',
              textDecorationColor: '#FF3120',
              textUnderlineOffset: '3px',
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}

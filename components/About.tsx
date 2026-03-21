'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'

export function About() {
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
      <RuleLabel number="ABOUT" />
      <h2
        className="reveal-text font-serif"
        style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
      >
        Designer. Student.{' '}
        <span style={{ color: '#FF3120' }}>Human.</span>
      </h2>
      <p
        className="reveal-text font-mono mt-6"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '480px' }}
      >
        UX design student at SCAD, figuring out what good design can actually do. I think like a designer but see like an artist. Still learning. Always curious.
      </p>
    </section>
  )
}

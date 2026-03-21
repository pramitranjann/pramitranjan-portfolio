'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'
import { FilmStrip } from './FilmStrip'

export function PhotographyStage() {
  const textRef = useRef<HTMLDivElement>(null)
  const filmRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const text = textRef.current
    const film = filmRef.current
    if (!text || !film) return

    const textObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(text.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((el, i) => setTimeout(() => el.classList.add('revealed'), i * 300))
          textObs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    textObs.observe(text)

    const filmObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          film.classList.add('revealed')
          filmObs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    filmObs.observe(film)

    return () => { textObs.disconnect(); filmObs.disconnect() }
  }, [])

  return (
    <section
      className="border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      <div className="grid grid-cols-2 gap-12 items-center">
        {/* Text left */}
        <div ref={textRef}>
          <RuleLabel number="THE EYE CAME FIRST." />

          <h2
            className="reveal-text font-serif italic"
            style={{ fontSize: '32px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2 }}
          >
            Before <span style={{ color: '#FF3120' }}>Figma</span>, there was{' '}
            <span style={{ color: '#FF3120' }}>film</span>.
          </h2>

          <p
            className="reveal-text font-mono mt-4"
            style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '320px' }}
          >
            Street photography across Southeast Asia. Shot on 35mm and medium format. Always looking.
          </p>

          <a
            href="/creative/photography"
            className="reveal-text font-mono inline-block mt-6 transition-colors duration-150"
            style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#FF3120')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#444444')}
          >
            VIEW ALL →
          </a>
        </div>

        {/* Film strip right */}
        <div ref={filmRef} className="reveal-slide overflow-hidden">
          <FilmStrip />
        </div>
      </div>
    </section>
  )
}

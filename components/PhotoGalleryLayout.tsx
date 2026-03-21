'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence } from 'motion/react'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { RuleLabel } from './RuleLabel'
import { PhotoLightbox } from './PhotoLightbox'

interface PhotoGalleryLayoutProps {
  city: string
  descriptor: string
  frameCount?: number
}

export function PhotoGalleryLayout({ city, descriptor, frameCount = 12 }: PhotoGalleryLayoutProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)

  function open(i: number) { setSelected(i) }
  function close() { setSelected(null) }
  function prev() {
    setDirection(-1)
    setSelected((s) => (s !== null && s > 0 ? s - 1 : s))
  }
  function next() {
    setDirection(1)
    setSelected((s) => (s !== null && s < frameCount - 1 ? s + 1 : s))
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>
        <section style={{ padding: '48px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/creative/photography" className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#444444' }}>
              ← PHOTOGRAPHY
            </Link>
          </div>
          <RuleLabel number="PHOTOGRAPHY" />
          <h1 className="font-serif" style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '8px' }}>
            {city}
          </h1>
          <p className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', marginBottom: '48px' }}>
            {descriptor}
          </p>

          {/* Photo grid — 3 col */}
          <div className="grid grid-cols-3" style={{ gap: '2px' }}>
            {Array.from({ length: frameCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => open(i)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid #1a1a1a',
                    aspectRatio: '2/3',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#FF3120' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1a1a' }}
                />
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />

      {/* Lightbox — AnimatePresence handles mount/unmount fade */}
      <AnimatePresence>
        {selected !== null && (
          <PhotoLightbox
            index={selected}
            total={frameCount}
            direction={direction}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </>
  )
}

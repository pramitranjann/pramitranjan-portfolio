'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence } from 'motion/react'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { PhotoLightbox } from './PhotoLightbox'

interface PhotoGalleryLayoutProps {
  city: string
  descriptor: string
  images: string[]
}

export function PhotoGalleryLayout({ city, descriptor, images }: PhotoGalleryLayoutProps) {
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
    setSelected((s) => (s !== null && s < images.length - 1 ? s + 1 : s))
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section style={{ padding: '48px 40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/creative/photography" className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }}>
              <span className="arrow-nudge-back">←</span> PHOTOGRAPHY
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '8px' }}>
            {city}
          </h1>
          <p className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#999999', marginBottom: '40px' }}>
            {descriptor}
          </p>

          {/* Photo grid — 3 col desktop, 2 col mobile */}
          <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '4px' }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => open(i)}
                style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <div className="portfolio-card" style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', backgroundColor: '#161616' }}>
                  <Image
                    src={src}
                    alt={`${city} ${String(i + 1).padStart(2, '0')}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />

      <AnimatePresence>
        {selected !== null && (
          <PhotoLightbox
            src={images[selected]}
            alt={`${city} ${String(selected + 1).padStart(2, '0')}`}
            index={selected}
            total={images.length}
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

'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence } from 'motion/react'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { PhotoLightbox } from './PhotoLightbox'
import { SafeProjectSpotifySection } from './SafeProjectSpotifySection'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { playNav } from '@/lib/sounds'
import type { GalleryStyleSettings, PhotographyImageDetails, ProjectSpotifyMedia } from '@/lib/site-content-schema'

interface PhotoGalleryLayoutProps {
  city: string
  descriptor: string
  images: string[]
  contextTitle?: string
  contextBody?: string
  imageDetails?: PhotographyImageDetails[]
  styleSettings: GalleryStyleSettings
  spotify?: ProjectSpotifyMedia
}

export function PhotoGalleryLayout({ city, descriptor, images, contextTitle, contextBody, imageDetails, styleSettings, spotify }: PhotoGalleryLayoutProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)
  const copy = useSiteCopy().creativePage

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
            <Link href="/creative/photography" className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }} onPointerDown={playNav}>
              <span className="arrow-nudge-back">←</span> {copy.photoBackLabel}
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: '#f5f2ed', lineHeight: 1.05, marginBottom: '8px' }}>
            {city}
          </h1>
          <p className="font-mono" style={{ fontSize: styleSettings.descriptorSize, letterSpacing: '0.1em', color: '#999999', marginBottom: '40px' }}>
            {descriptor}
          </p>
          {contextTitle || contextBody ? (
            <div
              style={{
                width: 'min(100%, 620px)',
                marginBottom: '32px',
                padding: '16px 18px',
                background: '#111111',
                border: '1px solid #1f1f1f',
                boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
              }}
            >
              <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.16em', color: '#666666', marginBottom: '8px' }}>
                {contextTitle ?? 'CONTEXT'}
              </div>
              {contextBody ? (
                <p className="font-mono" style={{ margin: 0, fontSize: '12px', letterSpacing: '0.03em', color: '#b4b4b4', lineHeight: 1.8, textWrap: 'pretty' }}>
                  {contextBody}
                </p>
              ) : null}
            </div>
          ) : null}
          <SafeProjectSpotifySection spotify={spotify} />
          {/* Photo grid — 4 col desktop, 3 col mobile */}
          <div className="grid grid-cols-3 md:grid-cols-4" style={{ gap: styleSettings.gridGap }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => open(i)}
                style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <div className="portfolio-card" style={{ position: 'relative', aspectRatio: styleSettings.imageAspectRatio, overflow: 'hidden', backgroundColor: '#161616' }}>
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
            alt={imageDetails?.[selected]?.alt || `${city} ${String(selected + 1).padStart(2, '0')}`}
            index={selected}
            total={images.length}
            direction={direction}
            details={imageDetails?.[selected]}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </>
  )
}

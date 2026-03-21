import Link from 'next/link'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { RuleLabel } from './RuleLabel'

interface PhotoGalleryLayoutProps {
  city: string
  descriptor: string
  frameCount?: number
}

export function PhotoGalleryLayout({ city, descriptor, frameCount = 12 }: PhotoGalleryLayoutProps) {
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
              <div
                key={i}
                style={{
                  backgroundColor: '#161616',
                  border: '1px solid #1a1a1a',
                  aspectRatio: '2/3',
                }}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

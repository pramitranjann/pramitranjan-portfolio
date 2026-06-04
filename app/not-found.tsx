import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ paddingTop: '57px', flex: '1 0 auto', display: 'flex' }}>
          <section
            style={{
              padding: '80px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {/* Ghost number — sits behind headline */}
            <div
              className="font-serif"
              style={{
                fontSize: 'clamp(100px, 18vw, 180px)',
                fontWeight: 'var(--font-weight-serif)',
                fontStyle: 'italic',
                color: '#141414',
                lineHeight: 1,
                marginBottom: '-40px',
                letterSpacing: '-4px',
                userSelect: 'none',
                position: 'relative',
                zIndex: 0,
              }}
            >
              404
            </div>
            {/* Headline */}
            <h1
              className="font-serif"
              style={{
                fontSize: 'var(--text-h1)',
                fontWeight: 'var(--font-weight-serif)',
                color: '#f5f2ed',
                lineHeight: 1.1,
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              Lost in the{' '}
              <span style={{ color: '#FF3120' }}>darkroom.</span>
            </h1>
            {/* Body */}
            <p
              className="font-mono"
              style={{
                fontSize: 'var(--text-body)',
                letterSpacing: '0.04em',
                color: '#999999',
                lineHeight: 1.9,
                maxWidth: '360px',
                marginBottom: '36px',
              }}
            >
              This page doesn't exist. Either you typed something wrong, or I haven't built it yet. Either way — let's get you back.
            </p>
            {/* CTA */}
            <Link
              href="/"
              className="font-mono"
              style={{
                fontSize: 'var(--text-meta)',
                letterSpacing: '0.14em',
                color: '#FF3120',
                border: '1px solid #FF3120',
                padding: '10px 20px',
                textDecoration: 'none',
              }}
            >
              BACK TO HOME →
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}

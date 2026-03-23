import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>
        <section style={{
          padding: '80px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '70vh',
          justifyContent: 'center',
        }}>
          {/* Ghost number — sits behind headline */}
          <div
            className="font-serif"
            style={{
              fontSize: 'clamp(100px, 18vw, 180px)',
              fontWeight: 400,
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
              fontWeight: 400,
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
          {/* Film strip stripe at bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'repeating-linear-gradient(90deg, #FF3120 0px, #FF3120 24px, transparent 24px, transparent 36px)',
            opacity: 0.3,
          }} />
        </section>
      </main>
      <Footer />
    </>
  )
}

import type { Metadata } from 'next'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import { GsapReveal } from '@/components/GsapReveal'
import { Nav } from '@/components/Nav'
import { QrCountdownClient } from '@/components/QrCountdownClient'

export const metadata: Metadata = {
  title: 'QR',
  description: 'A brief detour before the portfolio.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function QrPage() {
  return (
    <>
      <Nav />
      <main
        style={{
          paddingTop: '57px',
          minHeight: '100vh',
        }}
      >
        <section
          style={{
            minHeight: 'calc(100vh - 57px)',
            padding: '28px 40px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="qr-card-grid"
            style={{
              width: 'min(920px, 100%)',
              border: '1px solid var(--color-divider)',
              background: 'var(--color-card)',
            }}
          >
            <div style={{ padding: 'clamp(28px, 4vw, 44px)', borderRight: '1px solid var(--color-divider)' }}>
              <GsapReveal>
                <div data-reveal>
                  <AnimatedEyebrow label="QR_" marginBottom="20px" />
                </div>
                <h1
                  data-reveal
                  className="font-serif"
                  style={{
                    fontSize: 'clamp(44px, 6vw, 72px)',
                    fontWeight: 'var(--font-weight-serif)',
                    color: 'var(--color-heading)',
                    lineHeight: 0.96,
                    marginBottom: '20px',
                    maxWidth: '8ch',
                    textWrap: 'balance',
                  }}
                >
                  Strong curiosity. Respect.
                </h1>
                <p
                  data-reveal
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-body)',
                    letterSpacing: '0.03em',
                    color: 'var(--color-body)',
                    lineHeight: 1.8,
                    maxWidth: '40ch',
                    marginBottom: '28px',
                  }}
                >
                  You scanned the square. That earns a brief detour, a small wink, and then a clean handoff to the actual portfolio.
                </p>
                <div data-reveal className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#666666' }}>
                  SCAN COMPLETE
                </div>
              </GsapReveal>
            </div>

            <div style={{ padding: 'clamp(24px, 3vw, 32px)', display: 'grid', alignContent: 'space-between', gap: '24px' }}>
              <GsapReveal>
                <div
                  data-reveal
                  className="font-mono"
                  style={{
                    display: 'grid',
                    gap: '10px',
                    fontSize: 'var(--text-meta)',
                    letterSpacing: '0.14em',
                    color: '#666666',
                  }}
                >
                  <span style={{ color: 'var(--color-red)' }}>NEXT MOVE</span>
                  <span>Short pause. Then redirect.</span>
                </div>
                <div data-reveal style={{ marginTop: '18px' }}>
                  <QrCountdownClient />
                </div>
              </GsapReveal>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

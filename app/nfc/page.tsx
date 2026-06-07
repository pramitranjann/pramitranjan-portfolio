import type { Metadata } from 'next'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import { GsapReveal } from '@/components/GsapReveal'
import { Nav } from '@/components/Nav'
import { NfcCountdownClient } from '@/components/NfcCountdownClient'

export const metadata: Metadata = {
  title: 'NFC',
  description: 'A brief detour before the portfolio.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NfcPage() {
  return (
    <>
      <Nav />
      <main
        className="qr-page-shell"
        style={{
          paddingTop: '57px',
          minHeight: '100vh',
        }}
      >
        <section
          className="qr-page-stage"
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
            <div className="qr-card-copy" style={{ padding: 'clamp(28px, 4vw, 44px)', borderRight: '1px solid var(--color-divider)' }}>
              <GsapReveal>
                <div data-reveal>
                  <AnimatedEyebrow label="NFC_" marginBottom="20px" />
                </div>
                <h1
                  data-reveal
                  className="font-serif qr-card-title"
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
                  Contact established.
                </h1>
                <p
                  data-reveal
                  className="font-mono qr-card-body"
                  style={{
                    fontSize: 'var(--text-body)',
                    letterSpacing: '0.03em',
                    color: 'var(--color-body)',
                    lineHeight: 1.8,
                    maxWidth: '32ch',
                    marginBottom: '20px',
                  }}
                >
                  No camera. No fumbling. Very efficient. Slightly show-offy.
                </p>
                <div data-reveal className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#666666' }}>
                  TAP COMPLETE
                </div>
              </GsapReveal>
            </div>

            <div className="qr-card-actions" style={{ padding: 'clamp(24px, 3vw, 32px)', display: 'grid', alignContent: 'space-between', gap: '24px' }}>
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
                  <span>Short pause. Then we act like this was completely seamless.</span>
                </div>
                <div data-reveal style={{ marginTop: '18px' }}>
                  <NfcCountdownClient />
                </div>
              </GsapReveal>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

import type { Metadata } from 'next'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import { CopyEmailButton } from '@/components/CopyEmailButton'
import { GsapReveal } from '@/components/GsapReveal'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Tap',
  description: 'Direct contact links for Pramit Ranjan.',
  robots: {
    index: false,
    follow: true,
  },
}

const tapActions = [
  {
    label: 'VIEW WEBSITE',
    href: 'https://www.pramitranjan.com/',
    external: false,
    tone: 'primary',
  },
  {
    label: 'EMAIL ME',
    href: 'mailto:pramitranjann@gmail.com',
    external: false,
    tone: 'priority',
  },
  {
    label: 'VIEW CV',
    href: '/pramit-ranjan-cv-2026.pdf',
    external: true,
    tone: 'secondary',
  },
  {
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/in/pramitranjann/',
    external: true,
    tone: 'secondary',
  },
] as const

export default function TapPage() {
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
                  <AnimatedEyebrow label="CONTACT_" marginBottom="20px" />
                </div>
                <h1
                  data-reveal
                  className="font-serif qr-card-title"
                  style={{
                    fontSize: 'clamp(42px, 6vw, 68px)',
                    fontWeight: 'var(--font-weight-serif)',
                    color: 'var(--color-heading)',
                    lineHeight: 0.96,
                    marginBottom: '14px',
                    maxWidth: '10ch',
                    textWrap: 'balance',
                  }}
                >
                  Pramit Ranjan.
                </h1>
                <p
                  data-reveal
                  className="font-mono qr-card-body"
                  style={{
                    fontSize: 'var(--text-body)',
                    letterSpacing: '0.03em',
                    color: 'var(--color-body)',
                    lineHeight: 1.7,
                    maxWidth: '28ch',
                    marginBottom: '18px',
                    textWrap: 'pretty',
                  }}
                >
                  UX design student at SCAD. Designer with an artist&apos;s eye.
                </p>
                <div
                  data-reveal
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-meta)',
                    letterSpacing: '0.14em',
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                    <a
                      href="mailto:pramitranjann@gmail.com"
                      style={{
                        color: 'var(--color-red)',
                        textDecoration: 'none',
                        width: 'fit-content',
                      }}
                    >
                      PRAMITRANJANN@GMAIL.COM
                    </a>
                    <CopyEmailButton email="pramitranjann@gmail.com" />
                  </div>
                  <span style={{ color: 'var(--color-label)' }}>KUALA LUMPUR / SAVANNAH</span>
                </div>
              </GsapReveal>
            </div>

            <div className="qr-card-actions" style={{ padding: 'clamp(24px, 3vw, 32px)', display: 'grid', alignContent: 'space-between', gap: '24px' }}>
              <GsapReveal>
                <div
                  data-reveal
                  className="qr-actions-grid"
                  style={{
                    display: 'grid',
                    gap: '12px',
                  }}
                >
                  {tapActions.map(({ label, href, external, tone }) => (
                    <a
                      key={label}
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="font-mono"
                      style={{
                        fontSize: 'var(--text-meta)',
                        letterSpacing: '0.14em',
                        color:
                          tone === 'primary'
                            ? 'var(--color-bg)'
                            : tone === 'priority'
                              ? 'var(--color-red)'
                              : 'var(--color-heading)',
                        border:
                          tone === 'primary'
                            ? '1px solid var(--color-red)'
                            : tone === 'priority'
                              ? '1px solid var(--color-red)'
                              : '1px solid var(--color-divider)',
                        background:
                          tone === 'primary'
                            ? 'var(--color-red)'
                            : tone === 'priority'
                              ? 'transparent'
                              : 'rgba(255, 255, 255, 0.02)',
                        padding: '14px 16px',
                        textDecoration: 'none',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <span>{label}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              </GsapReveal>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

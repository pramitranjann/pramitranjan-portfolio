import type { Metadata } from 'next'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
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
    label: 'VIEW CV',
    href: '/pramit-ranjan-cv-2026.pdf',
    external: true,
    tone: 'primary',
  },
  {
    label: 'EMAIL ME',
    href: 'mailto:pramit@pramitranjann.com',
    external: false,
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
                  <AnimatedEyebrow label="TAP_" marginBottom="20px" />
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
                    lineHeight: 1.8,
                    maxWidth: '32ch',
                    marginBottom: '14px',
                  }}
                >
                  Product designer, researcher, and builder.
                </p>
                <div
                  data-reveal
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-body)',
                    letterSpacing: '0.03em',
                    color: 'var(--color-body)',
                    lineHeight: 1.8,
                    maxWidth: '34ch',
                    marginBottom: '24px',
                    textWrap: 'pretty',
                  }}
                >
                  Use this page for the practical things: website, CV, or direct contact.
                </div>
                <div
                  data-reveal
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-meta)',
                    letterSpacing: '0.14em',
                    color: '#666666',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: 'var(--color-red)' }}>DIRECT CONTACT</span>
                  <span>pramit@pramitranjann.com</span>
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
                  <span style={{ color: 'var(--color-red)' }}>SELECT AN OPTION</span>
                  <span>Start with the site, or go straight to the point.</span>
                </div>
                <div
                  data-reveal
                  className="qr-actions-grid"
                  style={{
                    display: 'grid',
                    gap: '12px',
                    marginTop: '18px',
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
                        color: tone === 'primary' ? 'var(--color-heading)' : 'var(--color-red)',
                        border: `1px solid ${tone === 'primary' ? 'var(--color-divider)' : 'var(--color-red)'}`,
                        background: tone === 'primary' ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
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

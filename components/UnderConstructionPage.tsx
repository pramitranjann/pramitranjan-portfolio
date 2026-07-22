import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

type UnderConstructionPageProps = {
  label?: string
  title?: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export function UnderConstructionPage({
  label = 'IN PROGRESS_',
  title = 'This page is still being built.',
  body = 'This section is not ready yet. I am still shaping the work, structure, and final presentation.',
  ctaLabel = 'BACK TO WORK',
  ctaHref = '/work',
}: UnderConstructionPageProps) {
  return (
    <>
      <Nav />

      <main style={{ paddingTop: '57px' }}>
        <section
          className="border-b border-divider"
          style={{
            minHeight: 'calc(100vh - 57px)',
            padding: 'var(--layout-hero-padding-y) var(--layout-page-gutter)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ maxWidth: '840px' }}>
            <div
              className="eyebrow-animate flex items-center"
              style={{ gap: '10px', marginBottom: '28px' }}
            >
              <div
                className="eyebrow-line"
                style={{
                  width: '32px',
                  height: '1px',
                  backgroundColor: 'var(--color-red)',
                }}
              />
              <span
                className="eyebrow-label font-mono"
                style={{
                  fontSize: 'var(--text-eyebrow)',
                  letterSpacing: '0.18em',
                  color: 'var(--color-red)',
                }}
              >
                {label}
              </span>
            </div>

            <h1
              className="font-serif"
              style={{
                fontSize: 'var(--text-h1)',
                fontWeight: 'var(--font-weight-serif)',
                color: 'var(--color-heading)',
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              {title}
            </h1>

            <p
              className="font-reading"
              style={{
                fontSize: 'var(--text-body-lg)',
                letterSpacing: '0.04em',
                color: 'var(--color-heading)',
                lineHeight: 1.8,
                maxWidth: '620px',
                marginTop: '24px',
                marginBottom: 0,
              }}
            >
              {body}
            </p>

            <Link
              href={ctaHref}
              className="font-mono"
              style={{
                display: 'inline-flex',
                marginTop: '32px',
                fontSize: 'var(--text-meta)',
                letterSpacing: '0.14em',
                color: 'var(--color-red)',
                border: '1px solid var(--color-red)',
                padding: '10px 18px',
                textDecoration: 'none',
              }}
            >
              {ctaLabel} <span className="arrow-nudge">→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
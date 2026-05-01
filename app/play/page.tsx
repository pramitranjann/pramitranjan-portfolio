import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { getPublicSiteContent } from '@/lib/site-content'

export default async function PlayPage() {
  const content = await getPublicSiteContent()
  const games = content.caseStudies.filter((item) => item.section === 'play')
  const copy = content.copy.playPage

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section
          className="border-b border-divider"
          style={{ padding: '56px var(--layout-page-gutter) 40px' }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: 'var(--text-eyebrow)',
              letterSpacing: '0.16em',
              color: 'var(--color-red)',
            }}
          >
            {copy.eyebrow}
          </p>

          <h1
            className="font-serif"
            style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 'var(--font-weight-serif)',
              color: 'var(--color-heading)',
              lineHeight: 1.05,
              marginTop: '16px',
            }}
          >
            {copy.heroTitle}
          </h1>

          <p
            className="font-mono"
            style={{
              fontSize: 'var(--text-body)',
              letterSpacing: '0.04em',
              color: 'var(--color-body)',
              lineHeight: 1.8,
              maxWidth: '720px',
              marginTop: '18px',
            }}
          >
            {copy.heroBody}
          </p>
        </section>

        <section className="work-grid-section" style={{ padding: '32px var(--layout-page-gutter)' }}>
          <div className="grid gap-4 md:grid-cols-2">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/play/${game.slug}`}
                className="portfolio-card block"
                style={{
                  background: '#111111',
                  border: '1px solid #1a1a1a',
                  padding: '24px',
                  textDecoration: 'none',
                }}
              >
                <p
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-eyebrow)',
                    letterSpacing: '0.16em',
                    color: 'var(--color-red)',
                    marginBottom: '14px',
                  }}
                >
                  {game.type}
                </p>

                <h2
                  className="font-serif"
                  style={{
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--font-weight-serif)',
                    color: 'var(--color-heading)',
                    marginBottom: '12px',
                  }}
                >
                  {game.title}
                </h2>

                <p
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-body)',
                    letterSpacing: '0.04em',
                    color: 'var(--color-body)',
                    lineHeight: 1.7,
                  }}
                >
                  {game.oneliner}
                </p>

                <p
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-meta)',
                    letterSpacing: '0.12em',
                    color: 'var(--color-red)',
                    marginTop: '20px',
                  }}
                >
                  {copy.cardCtaLabel} <span className="arrow-nudge">→</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

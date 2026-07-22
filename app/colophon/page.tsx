// app/colophon/page.tsx
import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { GsapReveal } from '@/components/GsapReveal'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import { buildBreadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Colophon',
    description:
      'How this site works: Next.js App Router, a JSON content system with a live editing dashboard, GSAP and Motion, Supabase behind /life, deployed on Vercel.',
    path: '/colophon',
    keywords: ['colophon', 'how this site is built', 'Next.js portfolio'],
  })
}

const STACK: Array<{ label: string; value: string }> = [
  { label: 'FRAMEWORK', value: 'Next.js App Router, React, TypeScript' },
  { label: 'CONTENT', value: 'One JSON file — copy and design tokens, edited live from a private dashboard' },
  { label: 'TYPE', value: 'DM Serif Display, DM Mono' },
  { label: 'MOTION', value: 'GSAP, Motion — respects reduced-motion' },
  { label: 'DATA', value: 'Supabase, behind the private /life section' },
  { label: 'HOSTING', value: 'Vercel' },
]

export default function ColophonPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Colophon', path: '/colophon' },
          ]),
        ]}
      />
      <Nav />
      <main style={{ paddingTop: '42px' }}>

        {/* Hero */}
        <section className="border-b border-divider" style={{ padding: '64px 40px' }}>
          <GsapReveal>
            <div data-reveal>
              <AnimatedEyebrow label="COLOPHON_" />
            </div>
            <h1
              data-reveal
              className="font-serif"
              style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: '#f5f2ed', lineHeight: 1.05, marginBottom: '28px' }}
            >
              How this site works.
            </h1>
            <p
              data-reveal
              className="font-reading"
              style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: 'var(--color-heading)', lineHeight: 1.9, maxWidth: '560px' }}
            >
              Built solo. Every word and design token on this site — type scale, spacing, colors —
              lives in one JSON file, edited live through a private dashboard. Nothing is hardcoded
              copy. Supabase sits behind /life, the personal system documented in the lab. Deployed
              on Vercel.
            </p>
          </GsapReveal>
        </section>

        {/* Stack */}
        <section className="border-b border-divider" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal>
              {STACK.map((row) => (
                <div
                  key={row.label}
                  className="grid border-b border-divider"
                  style={{ gridTemplateColumns: '160px 1fr', gap: '24px', padding: '16px 0' }}
                >
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.18em', color: '#666666' }}>
                    {row.label}
                  </span>
                  <span className="font-reading" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: 'var(--color-heading)', lineHeight: 1.7 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </GsapReveal>
        </section>

        {/* Cross-links */}
        <section style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal className="flex items-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="/lab"
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
                THE LAB →
              </a>
              <a
                href="/"
                className="font-mono"
                style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#666666', textDecoration: 'none' }}
              >
                BACK TO HOME
              </a>
            </div>
          </GsapReveal>
        </section>

      </main>
      <Footer />
    </>
  )
}

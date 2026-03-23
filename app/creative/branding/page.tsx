'use client'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { playCardEnter, playNav } from '@/lib/sounds'

const projects = [
  { slug: 'oracle', title: 'Oracle', desc: 'A Matrix-inspired clothing brand built from scratch.', tag: 'CLOTHING · BRANDING', cover: null },
  { slug: 'soho',   title: 'SOHO',   desc: 'Directed and branded a sixth form art exhibition.',     tag: 'EXHIBITION · BRANDING', cover: '/creative/branding/soho/cover.png' },
]

export default function BrandingPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section style={{ padding: '48px 40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/creative" className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }} onClick={playNav}>
              <span className="arrow-nudge-back">←</span> CREATIVE
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '40px' }}>
            Identity work.
          </h1>
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            {projects.map((p) => (
              <Link key={p.slug} href={`/creative/branding/${p.slug}`} className="h-full block" onClick={playCardEnter}>
                <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: '16px' }}>
                  <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '66.67%', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px', overflow: 'hidden' }}>
                    {p.cover && <img src={p.cover} alt={p.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <h2 className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>{p.title}</h2>
                  <p className="font-mono flex-1" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.6, marginBottom: '12px' }}>{p.desc}</p>
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>{p.tag}</span>
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120', marginTop: '6px', display: 'block' }}>VIEW <span className="arrow-nudge">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

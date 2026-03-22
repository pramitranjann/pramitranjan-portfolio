import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

const projects = [
  { slug: 'faces-of-power',  title: 'Faces of Power',  desc: 'Portraits, power, and the masks we wear.',        tag: 'GELLI PRINT · PHOTOGRAPHY', cover: '/creative/mixed-media/faces-of-power/hero.png' },
  { slug: 'south-china-sea', title: 'South China Sea', desc: 'Conflict, naivety, and the decisions of the few.', tag: 'CYANOTYPE · PHOTOGRAM',        cover: '/creative/mixed-media/south-china-sea/hero.png' },
]

export default function MixedMediaPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section style={{ padding: '48px 40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/creative" className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }}>
              <span className="arrow-nudge-back">←</span> CREATIVE
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '40px' }}>
            Beyond the screen.
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>
            {projects.map((p) => (
              <Link key={p.slug} href={`/creative/mixed-media/${p.slug}`} className="h-full block">
                <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: '16px' }}>
                  <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '66.67%', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px', overflow: 'hidden' }}>
                    <img src={p.cover} alt={p.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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

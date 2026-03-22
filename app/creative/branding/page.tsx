import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

const projects = [
  { title: 'Oracle', desc: 'A Matrix-inspired clothing brand built from scratch.', tag: 'CLOTHING · BRANDING' },
  { title: 'SOHO',   desc: 'Directed and branded a sixth form art exhibition.',     tag: 'EXHIBITION · BRANDING' },
]

export default function BrandingPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section style={{ padding: '48px 40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/creative" className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }}>
              ← CREATIVE
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '40px' }}>
            Identity work.
          </h1>
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            {projects.map((p) => (
              <div key={p.title} className="flex flex-col" style={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', padding: '16px' }}>
                <div style={{ width: '100%', height: '240px', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px' }} />
                <h2 className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>{p.title}</h2>
                <p className="font-mono flex-1" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.6, marginBottom: '12px' }}>{p.desc}</p>
                <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>{p.tag}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

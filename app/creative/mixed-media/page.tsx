import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { RuleLabel } from '@/components/RuleLabel'
import Link from 'next/link'

const projects = [
  { title: 'Faces of Power',  desc: 'Portraits, power, and the masks we wear.',            tag: 'GELLI PRINT · PHOTOGRAPHY' },
  { title: 'South China Sea', desc: 'Conflict, naivety, and the decisions of the few.',     tag: 'CYANOTYPE · PHOTOGRAM' },
]

export default function MixedMediaPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>
        <section style={{ padding: '48px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/creative" className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#444444' }}>
              ← CREATIVE
            </Link>
          </div>
          <RuleLabel number="MIXED MEDIA" />
          <h1 className="font-serif" style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '48px' }}>
            Beyond the screen.
          </h1>
          <div className="grid grid-cols-2" style={{ gap: '2px' }}>
            {projects.map((p) => (
              <div key={p.title} style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a', padding: '20px' }}>
                <div className="w-full mb-4" style={{ backgroundColor: '#161616', border: '1px solid #1a1a1a', aspectRatio: '4/3' }} />
                <h2 className="font-serif mb-2" style={{ fontSize: '20px', fontWeight: 400, color: '#f5f2ed' }}>{p.title}</h2>
                <p className="font-mono mb-4" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999' }}>{p.desc}</p>
                <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#444444' }}>{p.tag}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

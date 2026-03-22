'use client'

import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

function SectionHeader({ label, count }: { label: string; count: string }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1f1f1f' }}>
      <span className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.14em', color: '#f5f2ed' }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.16em', color: '#FF3120' }}>{count}</span>
    </div>
  )
}

function CreativeCard({ title, desc, tag, href, comingSoon, imageHeight = '240px' }: {
  title: string; desc: string; tag?: string; href?: string; comingSoon?: boolean; imageHeight?: string
}) {
  const inner = (
    <div className="flex flex-col h-full transition-opacity duration-150 hover:opacity-75" style={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', padding: '16px' }}>
      <div style={{ width: '100%', height: imageHeight, backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px' }} />
      <h3 className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>{title}</h3>
      <p className="font-mono flex-1" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.6, marginBottom: '12px' }}>{desc}</p>
      <div className="flex items-end justify-between">
        {tag && <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>{tag}</span>}
        {comingSoon
          ? <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>COMING SOON</span>
          : <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>VIEW →</span>
        }
      </div>
    </div>
  )
  return comingSoon || !href ? <div className="h-full">{inner}</div> : <Link href={href} className="h-full block">{inner}</Link>
}

export default function CreativePage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>

        {/* Hero */}
        <section className="border-b border-divider" style={{ padding: '64px 40px' }}>
          <div className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>CREATIVE_</span>
          </div>
          <h1
            className="font-serif"
            style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}
          >
            The other half.
          </h1>
          <p
            className="font-mono"
            style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '480px' }}
          >
            Photography, mixed media, and branding — the work that exists outside of UX.
          </p>
        </section>

        {/* Photography */}
        <section className="border-b border-divider" style={{ padding: '40px' }}>
          <SectionHeader label="PHOTOGRAPHY" count="04" />
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            <CreativeCard title="KL" desc="Street life and quiet corners of a city in motion." href="/creative/photography/kl" />
            <CreativeCard title="Penang" desc="Heritage streets and the texture of an older world." href="/creative/photography/penang" />
            <CreativeCard title="Singapore" desc="The duality of a city-state — dense and lush at once." href="/creative/photography/singapore" />
            <CreativeCard title="Ho Chi Minh" desc="Coming soon." comingSoon />
          </div>
        </section>

        {/* Mixed Media */}
        <section className="border-b border-divider" style={{ padding: '40px' }}>
          <SectionHeader label="MIXED MEDIA" count="03" />
          <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>
            <CreativeCard title="Faces of Power" desc="Portraits, power, and the masks we wear." tag="GELLI PRINT · PHOTOGRAPHY" href="/creative/mixed-media" />
            <CreativeCard title="South China Sea" desc="Conflict, naivety, and the decisions of the few." tag="CYANOTYPE · PHOTOGRAM" href="/creative/mixed-media" />
            <CreativeCard title="Project 03" desc="TBC" comingSoon />
          </div>
        </section>

        {/* Branding */}
        <section style={{ padding: '40px' }}>
          <SectionHeader label="BRANDING" count="02" />
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            <CreativeCard title="Oracle" desc="A Matrix-inspired clothing brand built from scratch." tag="CLOTHING · BRANDING" href="/creative/branding" />
            <CreativeCard title="SOHO" desc="Directed and branded a sixth form art exhibition." tag="EXHIBITION · BRANDING" href="/creative/branding" />
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

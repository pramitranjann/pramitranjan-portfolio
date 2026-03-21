'use client'

import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { RuleLabel } from '@/components/RuleLabel'
import Link from 'next/link'

function SectionHeader({ label, count }: { label: string; count: string }) {
  return (
    <div className="flex items-center justify-between border-b border-divider" style={{ marginBottom: '24px', paddingBottom: '16px' }}>
      <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>{label}</span>
      <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120' }}>{count}</span>
    </div>
  )
}

function CreativeCard({ title, desc, tag, href, comingSoon, titleSize = '20px' }: {
  title: string; desc: string; tag?: string; href?: string; comingSoon?: boolean; titleSize?: string
}) {
  const inner = (
    <div className="flex flex-col h-full transition-opacity duration-150 hover:opacity-75" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a', padding: '20px' }}>
      <div className="w-full mb-4" style={{ backgroundColor: '#161616', border: '1px solid #1a1a1a', aspectRatio: '4/3' }} />
      <h3 className="font-serif mb-2" style={{ fontSize: titleSize, fontWeight: 400, color: '#f5f2ed' }}>{title}</h3>
      <p className="font-mono mb-4 flex-1" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999' }}>{desc}</p>
      <div className="flex items-end justify-between">
        {tag && <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#444444' }}>{tag}</span>}
        {comingSoon
          ? <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}>COMING SOON</span>
          : <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF3120')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#444444')}>VIEW →</span>
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

        {/* Page header */}
        <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
          <RuleLabel number="CREATIVE WORK" />
          <h1 className="font-serif" style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '16px' }}>
            The other half.
          </h1>
          <p className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999' }}>
            Photography, mixed media, and branding — the work that exists outside of UX.
          </p>
        </section>

        {/* Photography */}
        <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
          <SectionHeader label="PHOTOGRAPHY" count="04" />
          <div className="grid grid-cols-2" style={{ gap: '2px' }}>
            <CreativeCard title="KL" desc="Street life and quiet corners of a city in motion." href="/creative/photography/kl" />
            <CreativeCard title="Penang" desc="Heritage streets and the texture of an older world." href="/creative/photography/penang" />
            <CreativeCard title="Singapore" desc="The duality of a city-state — dense and lush at once." href="/creative/photography/singapore" />
            <CreativeCard title="Ho Chi Minh" desc="Coming soon." comingSoon />
          </div>
        </section>

        {/* Mixed Media */}
        <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
          <SectionHeader label="MIXED MEDIA" count="03" />
          <div className="grid grid-cols-3" style={{ gap: '2px' }}>
            <CreativeCard title="Faces of Power" desc="Portraits, power, and the masks we wear." tag="GELLI PRINT · PHOTOGRAPHY" href="/creative/mixed-media" titleSize="14px" />
            <CreativeCard title="South China Sea" desc="Conflict, naivety, and the decisions of the few." tag="CYANOTYPE · PHOTOGRAM" href="/creative/mixed-media" titleSize="14px" />
            <CreativeCard title="Project 03" desc="TBC" comingSoon titleSize="14px" />
          </div>
        </section>

        {/* Branding */}
        <section style={{ padding: '48px 24px' }}>
          <SectionHeader label="BRANDING" count="02" />
          <div className="grid grid-cols-2" style={{ gap: '2px' }}>
            <CreativeCard title="Oracle" desc="A Matrix-inspired clothing brand built from scratch." tag="CLOTHING · BRANDING" href="/creative/branding" />
            <CreativeCard title="SOHO" desc="Directed and branded a sixth form art exhibition." tag="EXHIBITION · BRANDING" href="/creative/branding" />
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

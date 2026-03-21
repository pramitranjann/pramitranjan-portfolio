import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { RuleLabel } from '@/components/RuleLabel'
import Link from 'next/link'

const cities = [
  { slug: 'kl',        title: 'KL',          desc: 'Street life and quiet corners of a city in motion.' },
  { slug: 'penang',    title: 'Penang',       desc: 'Heritage streets and the texture of an older world.' },
  { slug: 'singapore', title: 'Singapore',    desc: 'The duality of a city-state — dense and lush at once.' },
  { slug: 'hcmc',      title: 'Ho Chi Minh',  desc: 'Coming soon.', comingSoon: true },
]

export default function PhotographyPage() {
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
          <RuleLabel number="PHOTOGRAPHY" />
          <h1 className="font-serif" style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '48px' }}>
            Always looking.
          </h1>
          <div className="grid grid-cols-2" style={{ gap: '2px' }}>
            {cities.map((city) => {
              const inner = (
                <div className="flex flex-col transition-opacity duration-150 hover:opacity-75" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a', padding: '20px' }}>
                  <div className="w-full mb-4" style={{ backgroundColor: '#161616', border: '1px solid #1a1a1a', aspectRatio: '4/3' }} />
                  <h2 className="font-serif mb-2" style={{ fontSize: '20px', fontWeight: 400, color: '#f5f2ed' }}>{city.title}</h2>
                  <p className="font-mono flex-1" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', marginBottom: '16px' }}>{city.desc}</p>
                  <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}>
                    {city.comingSoon ? 'COMING SOON' : 'VIEW →'}
                  </span>
                </div>
              )
              return city.comingSoon ? (
                <div key={city.slug}>{inner}</div>
              ) : (
                <Link key={city.slug} href={`/creative/photography/${city.slug}`}>{inner}</Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

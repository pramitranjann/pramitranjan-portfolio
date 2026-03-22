import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'

const cities = [
  { slug: 'kl',        title: 'KL',          desc: 'Street life and quiet corners of a city in motion.',      cover: '/creative/photography/kl/41.jpg',     comingSoon: false },
  { slug: 'penang',    title: 'Penang',       desc: 'Heritage streets and the texture of an older world.',     cover: '/creative/photography/penang/07.jpg',  comingSoon: false },
  { slug: 'singapore', title: 'Singapore',    desc: 'The duality of a city-state — dense and lush at once.',  cover: null,                                   comingSoon: true },
  { slug: 'hcmc',      title: 'Ho Chi Minh',  desc: 'Noise, heat, and the city that never slows down.',       cover: '/creative/photography/hcmc/01.jpg',    comingSoon: false },
]

export default function PhotographyPage() {
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
            Always looking.
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            {cities.map((city) => {
              const inner = (
                <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: '16px' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px', overflow: 'hidden' }}>
                    {city.cover && (
                      <Image
                        src={city.cover}
                        alt={city.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <h2 className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>{city.title}</h2>
                  <p className="font-mono flex-1" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.6, marginBottom: '12px' }}>{city.desc}</p>
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: city.comingSoon ? '#666666' : '#FF3120' }}>
                    {city.comingSoon ? 'COMING SOON' : <>VIEW <span className="arrow-nudge">→</span></>}
                  </span>
                </div>
              )
              return city.comingSoon ? (
                <div key={city.slug} className="h-full">{inner}</div>
              ) : (
                <Link key={city.slug} href={`/creative/photography/${city.slug}`} className="h-full block">{inner}</Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

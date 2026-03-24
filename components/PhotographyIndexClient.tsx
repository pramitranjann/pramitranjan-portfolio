'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { playCardEnter, playNav } from '@/lib/sounds'
import type { PhotographyCardStyleSettings, PhotographyCity } from '@/lib/site-content-schema'

export function PhotographyIndexClient({
  heroTitle,
  cities,
  cardStyle,
}: {
  heroTitle: string
  cities: PhotographyCity[]
  cardStyle: PhotographyCardStyleSettings
}) {
  const copy = useSiteCopy().creativePage

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <section style={{ padding: '48px 40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/creative" className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }} onPointerDown={playNav}>
              <span className="arrow-nudge-back">←</span> {copy.backLabel}
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '40px' }}>
            {heroTitle}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            {cities.map((city) => {
              const inner = (
                <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: cardStyle.cardPadding }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: cardStyle.imageAspectRatio, backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px', overflow: 'hidden' }}>
                    <Image src={city.cover} alt={city.title} fill style={{ objectFit: 'cover', objectPosition: city.imagePosition ?? 'center' }} sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <h2 className="font-serif" style={{ fontSize: cardStyle.titleSize, fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>{city.title}</h2>
                  <p className="font-mono flex-1" style={{ fontSize: cardStyle.bodySize, letterSpacing: '0.04em', color: '#999999', lineHeight: 1.6, marginBottom: '12px' }}>{city.desc}</p>
                  <span className="font-mono" style={{ fontSize: cardStyle.bodySize, letterSpacing: '0.1em', color: city.comingSoon ? '#666666' : '#FF3120' }}>
                    {city.comingSoon ? 'COMING SOON' : <>VIEW <span className="arrow-nudge">→</span></>}
                  </span>
                </div>
              )

              return city.comingSoon ? (
                <div key={city.slug} className="h-full">{inner}</div>
              ) : (
                <Link key={city.slug} href={`/creative/photography/${city.slug}`} className="h-full block" onPointerDown={playCardEnter}>{inner}</Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

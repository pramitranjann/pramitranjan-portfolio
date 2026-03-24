'use client'

import Image from 'next/image'
import Link from 'next/link'
import { playCardEnter } from '@/lib/sounds'
import type { PhotographyCardStyleSettings } from '@/lib/site-content-schema'

type CreativeListingCardProps = {
  title: string
  desc: string
  tag?: string
  href?: string
  cover?: string
  comingSoon?: boolean
  imagePosition?: string
  cardStyle?: PhotographyCardStyleSettings
}

export function CreativeListingCard({
  title,
  desc,
  tag,
  href,
  cover,
  comingSoon,
  imagePosition = 'center',
  cardStyle,
}: CreativeListingCardProps) {
  const inner = (
    <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: cardStyle?.cardPadding ?? '16px' }}>
      <div
        className="creative-card-image"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: cardStyle?.imageAspectRatio ?? '3 / 2',
          backgroundColor: '#252525',
          border: '1px solid #333333',
          marginBottom: '12px',
          overflow: 'hidden',
        }}
      >
        {cover ? <Image src={cover} alt={title} fill style={{ objectFit: 'cover', objectPosition: imagePosition }} sizes="(max-width: 768px) 50vw, 25vw" /> : null}
      </div>
      <h3 className="font-serif" style={{ fontSize: cardStyle?.titleSize ?? 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>
        <span className="card-title-inner">{title}</span>
      </h3>
      <p className="font-mono flex-1" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.6, marginBottom: '12px' }}>
        {desc}
      </p>
      <div className="flex flex-col" style={{ gap: '6px' }}>
        {tag ? <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>{tag}</span> : null}
        {comingSoon
          ? <span className="font-mono" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666' }}>COMING SOON</span>
          : <span className="font-mono" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>
              <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
            </span>}
      </div>
    </div>
  )

  return comingSoon || !href ? <div className="h-full">{inner}</div> : <Link href={href} className="h-full block" onClick={playCardEnter}>{inner}</Link>
}

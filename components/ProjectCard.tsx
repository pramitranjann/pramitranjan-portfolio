// components/ProjectCard.tsx
'use client'
import Link from 'next/link'
import { playCardEnter } from '@/lib/sounds'

interface ProjectCardProps {
  title: string
  oneliner: string
  tags: string[]
  href: string
  variant?: 'main' | 'supporting'
  imageRatio?: string
  comingSoon?: boolean
  cover?: string
}

function ratioPadding(ratio: string): string {
  const [w, h] = ratio.split('/').map(s => parseFloat(s.trim()))
  return `${(h / w) * 100}%`
}

export function ProjectCard({ title, oneliner, tags, href, variant = 'main', imageRatio, comingSoon, cover }: ProjectCardProps) {
  const category = tags.join(' · ')

  const cardBase = {
    backgroundColor: '#1c1c1c',
    padding: '16px',
    height: '100%',
  }

  const inner =
    variant === 'supporting' ? (
      <div className="portfolio-card" style={cardBase}>
        <div
          className="work-card-image"
          style={{
            position: 'relative',
            width: '100%',
            height: 0,
            paddingBottom: ratioPadding(imageRatio ?? '1 / 1'),
            backgroundColor: '#252525',
            border: '1px solid #333333',
            marginBottom: '12px',
            overflow: 'hidden',
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={title}
              loading="lazy"
              decoding="async"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', backgroundColor: '#111111' }}>
              <span className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#444444', textAlign: 'center', lineHeight: 1.4 }}>don&apos;t judge a book by its cover</span>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            </div>
          )}
        </div>
        <div className="font-serif" style={{ fontSize: 'var(--text-body)', color: '#f5f2ed' }}>
          <span className="card-title-inner">{title}</span>
        </div>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', marginTop: '4px', letterSpacing: '0.1em' }}>{category}</div>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em', marginTop: '8px' }}>
          <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
        </div>
      </div>
    ) : (
      <div className="portfolio-card" style={cardBase}>
        <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '100%', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '14px', overflow: 'hidden' }}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={title}
              loading="lazy"
              decoding="async"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', backgroundColor: '#111111' }}>
              <span className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#444444', textAlign: 'center', lineHeight: 1.4 }}>don&apos;t judge a book by its cover</span>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            </div>
          )}
        </div>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#999999', marginBottom: '8px' }}>{category}</div>
        <div className="font-serif" style={{ fontSize: 'var(--text-h3)', color: '#f5f2ed', marginBottom: '8px' }}>
          <span className="card-title-inner">{title}</span>
        </div>
        <div className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.6 }}>{oneliner}</div>
        {!comingSoon && (
          <div className="font-mono" style={{ marginTop: '14px', fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em' }}>
            <span className="card-cta-inner">VIEW</span> →
          </div>
        )}
        {comingSoon && (
          <div className="font-mono" style={{ marginTop: '14px', fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>COMING SOON</div>
        )}
      </div>
    )

  return comingSoon ? (
    <div style={{ height: '100%' }}>{inner}</div>
  ) : (
    <Link
      href={href}
      className="card-link"
      style={{ display: 'block', textDecoration: 'none', height: '100%' }}
      onClick={playCardEnter}
    >
      {inner}
    </Link>
  )
}

// components/ProjectCard.tsx
import Link from 'next/link'

interface ProjectCardProps {
  title: string
  oneliner: string
  tags: string[]
  href: string
  variant?: 'main' | 'supporting'
  imageRatio?: string
  comingSoon?: boolean
  hovered?: boolean
}

export function ProjectCard({ title, oneliner, tags, href, variant = 'main', imageRatio, comingSoon, hovered }: ProjectCardProps) {
  const category = tags.join(' · ')

  const cardBase = {
    backgroundColor: '#1c1c1c',
    border: `1px solid ${hovered ? '#FF3120' : '#2a2a2a'}`,
    transition: 'border-color 0.15s ease',
    padding: '16px',
    height: '100%',
  }

  const inner =
    variant === 'supporting' ? (
      <div style={cardBase}>
        <div className="work-card-image" style={{ aspectRatio: imageRatio ?? '3 / 4', width: '100%', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px' }} />
        <div className="font-serif" style={{ fontSize: 'var(--text-body)', color: '#f5f2ed' }}>{title}</div>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', marginTop: '4px', letterSpacing: '0.1em' }}>{category}</div>
      </div>
    ) : (
      <div style={cardBase}>
        <div style={{ aspectRatio: '1 / 1', width: '100%', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '14px' }} />
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#999999', marginBottom: '8px' }}>{category}</div>
        <div className="font-serif" style={{ fontSize: 'var(--text-h3)', color: '#f5f2ed', marginBottom: '8px' }}>{title}</div>
        <div className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.6 }}>{oneliner}</div>
        {!comingSoon && (
          <div className="font-mono" style={{ marginTop: '14px', fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em' }}>VIEW →</div>
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
    >
      {inner}
    </Link>
  )
}

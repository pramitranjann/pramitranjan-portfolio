// components/ProjectCard.tsx
'use client'
import Link from 'next/link'

interface ProjectCardProps {
  title: string
  oneliner: string
  tags: string[]
  href: string
  variant?: 'main' | 'supporting'
  comingSoon?: boolean
}

export function ProjectCard({ title, oneliner, tags, href, variant = 'main', comingSoon }: ProjectCardProps) {
  const titleSize = variant === 'main' ? '20px' : '14px'
  const aspectRatio = variant === 'main' ? '16/9' : '4/3'

  const inner = (
    <div
      className="flex flex-col h-full transition-opacity duration-150 hover:opacity-75"
      style={{
        backgroundColor: '#111111',
        border: '1px solid #1a1a1a',
        padding: '20px',
      }}
    >
      {/* Image placeholder */}
      <div
        className="w-full mb-4"
        style={{
          backgroundColor: '#161616',
          border: '1px solid #1a1a1a',
          aspectRatio,
        }}
      />

      {/* Title */}
      <h3
        className="font-serif mb-2"
        style={{ fontSize: titleSize, fontWeight: 400, color: '#f5f2ed' }}
      >
        {title}
      </h3>

      {/* One-liner */}
      <p
        className="font-mono mb-4 flex-1"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999' }}
      >
        {oneliner}
      </p>

      {/* Tags + CTA row */}
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono"
              style={{
                fontSize: '9px',
                letterSpacing: '0.14em',
                color: '#444444',
                border: '1px solid #1f1f1f',
                padding: '4px 10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        {comingSoon ? (
          <span
            className="font-mono flex-shrink-0"
            style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}
          >
            COMING SOON
          </span>
        ) : (
          <span
            className="font-mono flex-shrink-0 transition-colors duration-150"
            style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF3120')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#444444')}
          >
            VIEW →
          </span>
        )}
      </div>
    </div>
  )

  return comingSoon ? (
    <div className="h-full">{inner}</div>
  ) : (
    <Link href={href} className="h-full block">
      {inner}
    </Link>
  )
}

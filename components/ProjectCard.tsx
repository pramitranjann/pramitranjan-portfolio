// components/ProjectCard.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

interface ProjectCardProps {
  title: string
  oneliner: string
  tags: string[]
  href: string
  variant?: 'main' | 'supporting'
  comingSoon?: boolean
}

export function ProjectCard({ title, oneliner, tags, href, variant = 'main', comingSoon }: ProjectCardProps) {
  const category = tags.join(' · ')
  const [hovered, setHovered] = useState(false)

  const cardStyle = {
    backgroundColor: '#111111',
    border: `1px solid ${hovered && !comingSoon ? '#FF3120' : '#1a1a1a'}`,
    padding: '16px',
    opacity: hovered && !comingSoon ? 0.85 : 1,
    transition: 'opacity 0.2s ease, border-color 0.2s ease',
    cursor: comingSoon ? 'default' : 'pointer',
  }

  const inner =
    variant === 'supporting' ? (
      <div style={cardStyle}>
        <div style={{ aspectRatio: '4 / 3', width: '100%', backgroundColor: '#161616', border: '1px solid #1f1f1f', marginBottom: '12px' }} />
        <div className="font-serif" style={{ fontSize: '14px', color: '#999999' }}>{title}</div>
        <div className="font-mono" style={{ fontSize: '8px', color: '#444444', marginTop: '4px', letterSpacing: '0.1em' }}>{category}</div>
      </div>
    ) : (
      <div style={cardStyle}>
        <div style={{ aspectRatio: '1 / 1', width: '100%', backgroundColor: '#161616', border: '1px solid #1f1f1f', marginBottom: '14px' }} />
        <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#444444', marginBottom: '8px' }}>{category}</div>
        <div className="font-serif" style={{ fontSize: '20px', color: '#f5f2ed', marginBottom: '8px' }}>{title}</div>
        <div className="font-mono" style={{ fontSize: '11px', color: '#999999', lineHeight: 1.6 }}>{oneliner}</div>
        {!comingSoon && (
          <div className="font-mono" style={{ marginTop: '14px', fontSize: '9px', color: '#FF3120', letterSpacing: '0.1em' }}>VIEW →</div>
        )}
        {comingSoon && (
          <div className="font-mono" style={{ marginTop: '14px', fontSize: '9px', color: '#444444', letterSpacing: '0.1em' }}>COMING SOON</div>
        )}
      </div>
    )

  return comingSoon ? (
    <div>{inner}</div>
  ) : (
    <Link
      href={href}
      style={{ display: 'block', textDecoration: 'none' }}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {inner}
    </Link>
  )
}

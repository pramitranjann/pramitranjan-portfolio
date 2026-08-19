// components/ProjectCard.tsx
'use client'
import Link from 'next/link'
import { playCardEnter } from '@/lib/sounds'
import { HoverImageCarousel } from '@/components/HoverImageCarousel'
import { mergePreviewImages } from '@/lib/preview-images'
import type { HoverPreviewSettings } from '@/lib/site-content-schema'

interface ProjectCardProps {
  title: string
  oneliner: string
  tags: string[]
  href: string
  variant?: 'main' | 'supporting'
  imageRatio?: string
  comingSoon?: boolean
  cover?: string
  hoverImage?: string
  coverPosition?: string
  coverScale?: string
  hoverImagePosition?: string
  hoverImageScale?: string
  previewImages?: string[]
  panelBody?: string
  titleSize?: string
  metaSize?: string
  bodySize?: string
  cardPadding?: string
  imageFit?: 'contain' | 'cover'
  imageBackground?: string
  imageBorderColor?: string
  imageBorderWidth?: string
  hoverPreviewSettings?: HoverPreviewSettings
  priorityImage?: boolean
}

function ratioPadding(ratio: string): string {
  const [w, h] = ratio.split('/').map(s => parseFloat(s.trim()))
  return `${(h / w) * 100}%`
}

export function ProjectCard({
  title,
  oneliner,
  tags,
  href,
  variant = 'main',
  imageRatio,
  comingSoon,
  cover,
  coverPosition,
  coverScale,
  previewImages,
  panelBody,
  titleSize,
  metaSize,
  bodySize,
  cardPadding,
  imageFit,
  imageBackground,
  imageBorderColor,
  imageBorderWidth,
  priorityImage = false,
}: ProjectCardProps) {
  const category = tags.join(' · ')
  const cardImages = mergePreviewImages(cover, previewImages)

  const cardBase = {
    backgroundColor: '#1c1c1c',
    padding: cardPadding ?? '16px',
    height: '100%',
  }

  /* The description absorbs the card's leftover height so the CTA row always lands on the
     bottom edge, and reserves two lines so a short one-liner cannot pull it up. Cards in a
     row are the same height, so every CTA and tag line agrees across the grid. */
  const descriptionStyle = {
    fontSize: bodySize ?? 'var(--text-meta)',
    color: 'var(--color-body)',
    lineHeight: 1.6,
    marginTop: '6px',
    flex: '1 1 auto',
    minHeight: '2lh',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  }

  const inner =
    variant === 'supporting' ? (
      <div className="portfolio-card" style={{ ...cardBase, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div
          className="work-card-image"
          style={{
            position: 'relative',
            width: '100%',
            height: 0,
            paddingBottom: ratioPadding(imageRatio ?? '1 / 1'),
            backgroundColor: imageBackground ?? '#252525',
            border: `${imageBorderWidth ?? '1px'} solid ${imageBorderColor ?? '#333333'}`,
            marginBottom: '12px',
            overflow: 'hidden',
            flex: '0 0 auto',
          }}
        >
          {cardImages.length ? (
            <HoverImageCarousel
              images={cardImages}
              alt={title}
              hovered={false}
              sizes="(max-width: 768px) 100vw, 24vw"
              imageFit={imageFit ?? 'cover'}
              imagePosition={coverPosition ?? 'center'}
              imageScale={coverScale ?? '1'}
              priorityFirstFrame={priorityImage}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', backgroundColor: '#111111' }}>
              <span className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#444444', textAlign: 'center', lineHeight: 1.4 }}>don&apos;t judge a book by its cover</span>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            </div>
          )}
        </div>
        <div className="font-serif" style={{ fontSize: titleSize ?? 'var(--text-body)', color: 'var(--color-heading)', flex: '0 0 auto' }}>
          <span className="card-title-inner">{title}</span>
        </div>
        <p className="font-reading" style={descriptionStyle}>{oneliner}</p>
        {/* CTA left, tags hard right — one row of chrome at the foot of the card. */}
        <div className="flex items-baseline justify-between" style={{ gap: '12px', marginTop: '10px', flex: '0 0 auto' }}>
          <span className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', color: comingSoon ? 'var(--color-body)' : 'var(--color-red)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            {comingSoon ? 'COMING SOON' : <><span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span></>}
          </span>
          <span className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-label)', letterSpacing: '0.1em', textAlign: 'right' }}>{category}</span>
        </div>
        {!comingSoon && (
          <div className="pcard-hover" aria-hidden="true" style={{ padding: cardPadding ?? '16px' }}>
            <div className="pcard-hover-title font-serif" style={{ fontSize: titleSize ?? 'var(--text-body)' }}>{title}</div>
            <div className="pcard-hover-meta font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)' }}>{category}</div>
            <div className="pcard-hover-rule" />
            <div className="pcard-hover-body font-reading" style={{ fontSize: metaSize ?? 'var(--text-meta)' }}>{panelBody ?? oneliner}</div>
          </div>
        )}
      </div>
    ) : (
      <div className="portfolio-card" style={cardBase}>
        <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '100%', backgroundColor: imageBackground ?? '#252525', border: `${imageBorderWidth ?? '1px'} solid ${imageBorderColor ?? '#333333'}`, marginBottom: '14px', overflow: 'hidden' }}>
          {cardImages.length ? (
            <HoverImageCarousel
              images={cardImages}
              alt={title}
              hovered={false}
              sizes="(max-width: 768px) 100vw, 32vw"
              imageFit={imageFit ?? 'cover'}
              imagePosition={coverPosition ?? 'center'}
              imageScale={coverScale ?? '1'}
              priorityFirstFrame={priorityImage}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', backgroundColor: '#111111' }}>
              <span className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#444444', textAlign: 'center', lineHeight: 1.4 }}>don&apos;t judge a book by its cover</span>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            </div>
          )}
        </div>
        <div className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', letterSpacing: '0.14em', color: 'var(--color-body)', marginBottom: '8px' }}>{category}</div>
        <div className="font-serif" style={{ fontSize: titleSize ?? 'var(--text-h3)', color: 'var(--color-heading)', marginBottom: '8px' }}>
          <span className="card-title-inner">{title}</span>
        </div>
        <div className="font-reading" style={{ fontSize: bodySize ?? 'var(--text-body)', color: 'var(--color-body)', lineHeight: 1.6 }}>{oneliner}</div>
        {!comingSoon && (
          <div className="font-mono" style={{ marginTop: '14px', fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.1em' }}>
            <span className="card-cta-inner">VIEW</span> →
          </div>
        )}
        {comingSoon && (
          <div className="font-mono" style={{ marginTop: '14px', fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-body)', letterSpacing: '0.1em' }}>COMING SOON</div>
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
      onPointerDown={playCardEnter}
    >
      {inner}
    </Link>
  )

}

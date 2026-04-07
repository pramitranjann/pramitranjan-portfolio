// components/ProjectCard.tsx
'use client'
import Link from 'next/link'
import { playCardEnter } from '@/lib/sounds'
import { HoverPreviewSurface } from '@/components/HoverPreviewSurface'
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
  previewImages?: string[]
  titleSize?: string
  metaSize?: string
  bodySize?: string
  cardPadding?: string
  imageFit?: 'contain' | 'cover'
  imageBackground?: string
  imageBorderColor?: string
  imageBorderWidth?: string
  hoverPreviewSettings?: HoverPreviewSettings
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
  hoverImage,
  coverPosition,
  previewImages,
  titleSize,
  metaSize,
  bodySize,
  cardPadding,
  imageFit,
  imageBackground,
  imageBorderColor,
  imageBorderWidth,
  hoverPreviewSettings,
}: ProjectCardProps) {
  const category = tags.join(' · ')
  const cardImages = mergePreviewImages(cover, previewImages)
  const hoverRevealImage = hoverImage ?? previewImages?.[0] ?? cover

  const cardBase = {
    backgroundColor: '#1c1c1c',
    padding: cardPadding ?? '16px',
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
            backgroundColor: imageBackground ?? '#252525',
            border: `${imageBorderWidth ?? '1px'} solid ${imageBorderColor ?? '#333333'}`,
            marginBottom: '12px',
            overflow: 'hidden',
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
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', backgroundColor: '#111111' }}>
              <span className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#444444', textAlign: 'center', lineHeight: 1.4 }}>don&apos;t judge a book by its cover</span>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            </div>
          )}
        </div>
        <div className="font-serif" style={{ fontSize: titleSize ?? 'var(--text-body)', color: 'var(--color-heading)' }}>
          <span className="card-title-inner">{title}</span>
        </div>
        <div className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-body)', marginTop: '4px', letterSpacing: '0.1em' }}>{category}</div>
        <div className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.1em', marginTop: '8px' }}>
          <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
        </div>
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
        <div className="font-mono" style={{ fontSize: bodySize ?? 'var(--text-body)', color: 'var(--color-body)', lineHeight: 1.6 }}>{oneliner}</div>
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

  const cardBody = comingSoon ? (
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

  if (comingSoon || !hoverPreviewSettings?.enabled) {
    return cardBody
  }

  return (
    <HoverPreviewSurface
      enabled={hoverPreviewSettings.enabled}
      settings={hoverPreviewSettings}
      preview={{
        title,
        body: oneliner,
        image: cover,
        imagePosition: coverPosition,
        metadata: tags.slice(0, 3),
        ctaLabel: 'OPEN CASE STUDY',
      }}
    >
      {({ hovered }) => {
        const hiddenTextStyle = {
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'translateY(8px)' : 'translateY(0px)',
          transition: 'opacity 110ms ease-out, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        } as const

        const withCarousel = variant === 'supporting' ? (
          <div className="portfolio-card" style={cardBase}>
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
              }}
            >
              {hoverRevealImage ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 220ms ease-out',
                  }}
                >
                  <HoverImageCarousel
                    images={[hoverRevealImage]}
                    alt={title}
                    hovered={false}
                    sizes="(max-width: 768px) 100vw, 24vw"
                    imageFit={imageFit ?? 'cover'}
                    imagePosition={coverPosition ?? 'center'}
                  />
                </div>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', backgroundColor: '#111111' }}>
                  <span className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#444444', textAlign: 'center', lineHeight: 1.4 }}>don&apos;t judge a book by its cover</span>
                  <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
                </div>
              )}
            </div>
            <div className="font-serif" style={{ fontSize: titleSize ?? 'var(--text-body)', color: 'var(--color-heading)', ...hiddenTextStyle }}>
              <span className="card-title-inner">{title}</span>
            </div>
            <div className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-body)', marginTop: '4px', letterSpacing: '0.1em', ...hiddenTextStyle }}>{category}</div>
            <div className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.1em', marginTop: '8px', ...hiddenTextStyle }}>
              <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
            </div>
          </div>
        ) : (
          <div className="portfolio-card" style={cardBase}>
            <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '100%', backgroundColor: imageBackground ?? '#252525', border: `${imageBorderWidth ?? '1px'} solid ${imageBorderColor ?? '#333333'}`, marginBottom: '14px', overflow: 'hidden' }}>
              {cardImages.length ? (
                <HoverImageCarousel
                  images={cardImages}
                  alt={title}
                  hovered={hovered}
                  sizes="(max-width: 768px) 100vw, 32vw"
                  imageFit={imageFit ?? 'cover'}
                  imagePosition={coverPosition ?? 'center'}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', backgroundColor: '#111111' }}>
                  <span className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#444444', textAlign: 'center', lineHeight: 1.4 }}>don&apos;t judge a book by its cover</span>
                  <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
                </div>
              )}
            </div>
            <div className="font-mono" style={{ fontSize: metaSize ?? 'var(--text-meta)', letterSpacing: '0.14em', color: 'var(--color-body)', marginBottom: '8px', ...hiddenTextStyle }}>{category}</div>
            <div className="font-serif" style={{ fontSize: titleSize ?? 'var(--text-h3)', color: 'var(--color-heading)', marginBottom: '8px', ...hiddenTextStyle }}>
              <span className="card-title-inner">{title}</span>
            </div>
            <div className="font-mono" style={{ fontSize: bodySize ?? 'var(--text-body)', color: 'var(--color-body)', lineHeight: 1.6, ...hiddenTextStyle }}>{oneliner}</div>
            {!comingSoon && (
              <div className="font-mono" style={{ marginTop: '14px', fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-red)', letterSpacing: '0.1em', ...hiddenTextStyle }}>
                <span className="card-cta-inner">VIEW</span> →
              </div>
            )}
            {comingSoon && (
              <div className="font-mono" style={{ marginTop: '14px', fontSize: metaSize ?? 'var(--text-meta)', color: 'var(--color-body)', letterSpacing: '0.1em', ...hiddenTextStyle }}>COMING SOON</div>
            )}
          </div>
        )

        return comingSoon ? (
          <div style={{ height: '100%' }}>{withCarousel}</div>
        ) : (
          <Link
            href={href}
            className="card-link"
            style={{ display: 'block', textDecoration: 'none', height: '100%' }}
            onPointerDown={playCardEnter}
          >
            {withCarousel}
          </Link>
        )
      }}
    </HoverPreviewSurface>
  )
}

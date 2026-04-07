'use client'

import Image from 'next/image'
import Link from 'next/link'
import { playCardEnter } from '@/lib/sounds'
import { HoverPreviewSurface } from '@/components/HoverPreviewSurface'
import { HoverImageCarousel } from '@/components/HoverImageCarousel'
import { mergePreviewImages } from '@/lib/preview-images'
import type { HoverPreviewSettings, PhotographyCardStyleSettings } from '@/lib/site-content-schema'

type CreativeListingCardProps = {
  title: string
  desc: string
  tag?: string
  href?: string
  cover?: string
  previewImages?: string[]
  comingSoon?: boolean
  imagePosition?: string
  imageScale?: string
  hoverImagePosition?: string
  hoverImageScale?: string
  cardStyle?: PhotographyCardStyleSettings
  hoverPreviewSettings?: HoverPreviewSettings
  priorityImage?: boolean
}

export function CreativeListingCard({
  title,
  desc,
  tag,
  href,
  cover,
  previewImages,
  comingSoon,
  imagePosition = 'center',
  imageScale,
  hoverImagePosition,
  hoverImageScale,
  cardStyle,
  hoverPreviewSettings,
  priorityImage = false,
}: CreativeListingCardProps) {
  const cardImages = mergePreviewImages(cover, previewImages)

  const inner = (
    <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: cardStyle?.cardPadding ?? '16px' }}>
      <div
        className="creative-card-image"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: cardStyle?.imageAspectRatio ?? '3 / 2',
          backgroundColor: cardStyle?.imageBackground ?? '#252525',
          border: `${cardStyle?.imageBorderWidth ?? '1px'} solid ${cardStyle?.imageBorderColor ?? '#333333'}`,
          marginBottom: '12px',
          overflow: 'hidden',
        }}
      >
        {cardImages.length ? <Image src={cardImages[0]} alt={title} fill priority={priorityImage} style={{ objectFit: cardStyle?.imageFit ?? 'cover', objectPosition: imagePosition, transform: `scale(${imageScale ?? '1'})` }} sizes="(max-width: 768px) 50vw, 25vw" /> : null}
      </div>
      <h3 className="font-serif" style={{ fontSize: cardStyle?.titleSize ?? 'var(--text-body)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', marginBottom: '4px' }}>
        <span className="card-title-inner">{title}</span>
      </h3>
      <p className="font-mono flex-1" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.04em', color: 'var(--color-body)', lineHeight: 1.6, marginBottom: '12px' }}>
        {desc}
      </p>
      <div className="flex flex-col" style={{ gap: '6px' }}>
        {tag ? <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: 'var(--color-label)' }}>{tag}</span> : null}
        {comingSoon
          ? <span className="font-mono" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.1em', color: 'var(--color-label)' }}>COMING SOON</span>
          : <span className="font-mono" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.1em', color: 'var(--color-red)' }}>
              <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
            </span>}
      </div>
    </div>
  )

  const cardBody =
    comingSoon || !href ? <div className="h-full">{inner}</div> : <Link href={href} className="h-full block" onPointerDown={playCardEnter}>{inner}</Link>

  if (comingSoon || !href || !hoverPreviewSettings?.enabled) {
    return cardBody
  }

  const ctaLabel = href.startsWith('/creative/photography') ? 'OPEN GALLERY' : 'OPEN PROJECT'
  const metadata = tag ? [tag] : []

  return (
    <HoverPreviewSurface
      enabled={hoverPreviewSettings.enabled}
      settings={hoverPreviewSettings}
      preview={{
        title,
        body: desc,
        image: cover,
        imagePosition,
        metadata,
        ctaLabel,
      }}
    >
      {({ hovered }) => {
        const hiddenTextStyle = {
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'translateY(8px)' : 'translateY(0px)',
          transition: 'opacity 110ms ease-out, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        } as const

        const hoverCard = (
          <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: cardStyle?.cardPadding ?? '16px' }}>
            <div
              className="creative-card-image"
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: cardStyle?.imageAspectRatio ?? '3 / 2',
                backgroundColor: cardStyle?.imageBackground ?? '#252525',
                border: `${cardStyle?.imageBorderWidth ?? '1px'} solid ${cardStyle?.imageBorderColor ?? '#333333'}`,
                marginBottom: '12px',
                overflow: 'hidden',
              }}
            >
              {cardImages.length ? (
                <HoverImageCarousel
                  images={cardImages}
                  alt={title}
                  hovered={hovered}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  imageFit={cardStyle?.imageFit ?? 'cover'}
                  imagePosition={hovered ? (hoverImagePosition ?? imagePosition) : imagePosition}
                  imageScale={hovered ? (hoverImageScale ?? imageScale ?? '1') : (imageScale ?? '1')}
                  priorityFirstFrame={priorityImage}
                />
              ) : null}
            </div>
            <h3 className="font-serif" style={{ fontSize: cardStyle?.titleSize ?? 'var(--text-body)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', marginBottom: '4px', ...hiddenTextStyle }}>
              <span className="card-title-inner">{title}</span>
            </h3>
            <p className="font-mono flex-1" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.04em', color: 'var(--color-body)', lineHeight: 1.6, marginBottom: '12px', ...hiddenTextStyle }}>
              {desc}
            </p>
            <div className="flex flex-col" style={{ gap: '6px', ...hiddenTextStyle }}>
              {tag ? <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: 'var(--color-label)' }}>{tag}</span> : null}
              {comingSoon
                ? <span className="font-mono" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.1em', color: 'var(--color-label)' }}>COMING SOON</span>
                : <span className="font-mono" style={{ fontSize: cardStyle?.bodySize ?? 'var(--text-meta)', letterSpacing: '0.1em', color: 'var(--color-red)' }}>
                    <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
                  </span>}
            </div>
          </div>
        )

        return comingSoon || !href ? <div className="h-full">{hoverCard}</div> : <Link href={href} className="h-full block" onPointerDown={playCardEnter}>{hoverCard}</Link>
      }}
    </HoverPreviewSurface>
  )
}

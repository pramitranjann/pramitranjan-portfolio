'use client'

import Image from 'next/image'
import Link from 'next/link'
import { playCardEnter } from '@/lib/sounds'
import { HoverPreviewSurface } from '@/components/HoverPreviewSurface'
import { HoverImageCarousel } from '@/components/HoverImageCarousel'
import type { HoverPreviewSettings } from '@/lib/site-content-schema'

type PlayCardProps = {
  title: string
  oneliner: string
  type: string
  href: string
  images: string[]
  ctaLabel: string
  hoverPreviewSettings?: HoverPreviewSettings
  priorityImage?: boolean
}

export function PlayCard({
  title,
  oneliner,
  type,
  href,
  images,
  ctaLabel,
  hoverPreviewSettings,
  priorityImage = false,
}: PlayCardProps) {
  const inner = (
    <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: '16px' }}>
      <div className="play-card-image" style={{ position: 'relative', width: '100%', aspectRatio: '16 / 5', backgroundColor: '#252525', border: '1px solid #333333', overflow: 'hidden', marginBottom: '12px' }}>
        {images.length ? (
          <Image src={images[0]} alt={title} fill priority={priorityImage} style={{ objectFit: 'cover', objectPosition: 'center center' }} sizes="(max-width: 767px) 100vw, 520px" />
        ) : (
          <div className="font-mono" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444444', fontSize: 'var(--text-meta)', letterSpacing: '0.12em' }}>
            GAME PREVIEW
          </div>
        )}
      </div>
      <h2 className="font-serif" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.15, marginBottom: '18px' }}>
        {title}
      </h2>
      <p className="font-mono flex-1" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: 'var(--color-body)', lineHeight: 1.5, marginBottom: '10px' }}>
        {oneliner}
      </p>
      <p className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: 'var(--color-label)', textTransform: 'uppercase', marginBottom: '8px' }}>
        {type}
      </p>
      <p className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: 'var(--color-red)', margin: 0 }}>
        {ctaLabel} <span className="arrow-nudge">→</span>
      </p>
    </div>
  )

  if (!hoverPreviewSettings?.enabled) {
    return (
      <Link href={href} className="block" style={{ textDecoration: 'none' }} onPointerDown={playCardEnter}>
        {inner}
      </Link>
    )
  }

  return (
    <HoverPreviewSurface
      enabled={hoverPreviewSettings.enabled}
      settings={hoverPreviewSettings}
      preview={{ title, body: oneliner, image: images[0], metadata: [type], ctaLabel }}
    >
      {({ hovered }) => {
        const hiddenTextStyle = {
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'translateY(8px)' : 'translateY(0px)',
          transition: 'opacity 110ms ease-out, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        } as const

        const hoverCard = (
          <div className="portfolio-card flex flex-col h-full" style={{ backgroundColor: '#1c1c1c', padding: '16px' }}>
            <div className="play-card-image" style={{ position: 'relative', width: '100%', aspectRatio: '16 / 5', backgroundColor: '#252525', border: '1px solid #333333', overflow: 'hidden', marginBottom: '12px' }}>
              {images.length ? (
                <HoverImageCarousel
                  images={images}
                  alt={title}
                  hovered={hovered}
                  sizes="(max-width: 767px) 100vw, 520px"
                  imageFit="cover"
                  imagePosition="center center"
                  priorityFirstFrame={priorityImage}
                />
              ) : (
                <div className="font-mono" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444444', fontSize: 'var(--text-meta)', letterSpacing: '0.12em' }}>
                  GAME PREVIEW
                </div>
              )}
            </div>
            <h2 className="font-serif" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.15, marginBottom: '18px', ...hiddenTextStyle }}>
              {title}
            </h2>
            <p className="font-mono flex-1" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: 'var(--color-body)', lineHeight: 1.5, marginBottom: '10px', ...hiddenTextStyle }}>
              {oneliner}
            </p>
            <p className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: 'var(--color-label)', textTransform: 'uppercase', marginBottom: '8px', ...hiddenTextStyle }}>
              {type}
            </p>
            <p className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: 'var(--color-red)', margin: 0, ...hiddenTextStyle }}>
              {ctaLabel} <span className="arrow-nudge">→</span>
            </p>
          </div>
        )

        return (
          <Link href={href} className="block" style={{ textDecoration: 'none' }} onPointerDown={playCardEnter}>
            {hoverCard}
          </Link>
        )
      }}
    </HoverPreviewSurface>
  )
}

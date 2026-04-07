'use client'

import { useEffect, useRef, useState } from 'react'
import type { HoverPreviewSettings } from '@/lib/site-content-schema'

export interface HoverPreviewData {
  title: string
  body: string
  image?: string
  imagePosition?: string
  metadata?: string[]
  ctaLabel?: string
}

const HOVER_QUERY = '(hover: hover) and (pointer: fine)'

export function HoverPreviewSurface({
  enabled,
  settings,
  preview,
  children,
}: {
  enabled: boolean
  settings: HoverPreviewSettings
  preview: HoverPreviewData
  children: React.ReactNode
}) {
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [canHover, setCanHover] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia(HOVER_QUERY)
    const sync = () => setCanHover(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  function openPreview() {
    if (!enabled || !canHover) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => {
      setVisible(true)
    }, 45)
  }

  function closePreview() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setVisible(false)
    }, 65)
  }

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <div
      onPointerEnter={openPreview}
      onPointerLeave={closePreview}
      style={{ position: 'relative', height: '100%', isolation: 'isolate' }}
    >
      <div
        style={{
          height: '100%',
          transform: visible ? 'scale(0.988)' : 'scale(1)',
          transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          padding: settings.padding,
          background: settings.background,
          border: `1px solid ${settings.borderColor}`,
          boxShadow: visible ? settings.shadow : 'none',
          display: 'grid',
          alignContent: 'end',
          gap: '12px',
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0px) scale(1)' : 'translateY(8px) scale(0.985)',
          transition: 'opacity 160ms ease-out, transform 220ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 220ms cubic-bezier(0.23, 1, 0.32, 1)',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(0,0,0,0.06) 0%, ${settings.background} 38%, ${settings.background} 100%)`,
          }}
        />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '2px', background: settings.accentColor }} />

        {preview.metadata && preview.metadata.length > 0 ? (
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {preview.metadata.map((item) => (
              <span
                key={item}
                className="font-mono"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: settings.metaColor,
                  border: `1px solid ${settings.borderColor}`,
                  background: 'rgba(255,255,255,0.03)',
                  padding: '5px 8px',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}

        <div style={{ position: 'relative', display: 'grid', gap: '8px' }}>
          <div className="font-serif" style={{ fontSize: '24px', lineHeight: 1.05, color: settings.titleColor }}>
            {preview.title}
          </div>
          <div className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.03em', lineHeight: 1.7, color: settings.bodyColor }}>
            {preview.body}
          </div>
        </div>

        {preview.ctaLabel ? (
          <div
            className="font-mono"
            style={{
              position: 'relative',
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: settings.accentColor,
              width: 'fit-content',
            }}
          >
            {preview.ctaLabel} <span className="arrow-nudge">→</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

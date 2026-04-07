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
  children: React.ReactNode | ((state: { hovered: boolean }) => React.ReactNode)
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
    }, 18)
  }

  function closePreview() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setVisible(false)
    }, 36)
  }

  const childContent = typeof children === 'function' ? children({ hovered: visible }) : children

  if (!enabled) {
    return <>{childContent}</>
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
          transform: visible ? 'scale(0.995)' : 'scale(1)',
          transition: 'transform 140ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {childContent}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          padding: settings.padding,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          display: 'grid',
          alignContent: 'end',
          gap: '12px',
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0px)' : 'translateY(4px)',
          transition: 'opacity 120ms ease-out, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 42%, rgba(13,13,13,0.42) 62%, ${settings.background} 82%, ${settings.background} 100%)`,
          }}
        />

        {preview.metadata && preview.metadata.length > 0 ? (
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
            {preview.metadata.map((item) => (
              <span
                key={item}
                className="font-mono"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: settings.metaColor,
                  border: `1px solid ${settings.borderColor}`,
                  background: 'rgba(17,17,17,0.78)',
                  backdropFilter: 'blur(6px)',
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
              textShadow: '0 0 14px rgba(255,49,32,0.2)',
            }}
          >
            {preview.ctaLabel} <span className="arrow-nudge">→</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

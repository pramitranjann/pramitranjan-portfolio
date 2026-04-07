'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

function parseUnitValue(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

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
  const rootRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [canHover, setCanHover] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 24, left: 24 })
  const [placement, setPlacement] = useState<'left' | 'right'>('right')

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

  function updatePosition() {
    if (!rootRef.current || typeof window === 'undefined') return
    const rect = rootRef.current.getBoundingClientRect()
    const overlayWidth = parseUnitValue(settings.width, 320)
    const offsetX = parseUnitValue(settings.offsetX, 18)
    const offsetY = parseUnitValue(settings.offsetY, -8)
    const viewportPadding = 16
    const overlayHeight = overlayRef.current?.offsetHeight ?? 360

    let nextPlacement: 'left' | 'right' = rect.left < window.innerWidth * 0.58 ? 'right' : 'left'
    let left =
      nextPlacement === 'right'
        ? rect.right + offsetX
        : rect.left - overlayWidth - offsetX

    if (left + overlayWidth > window.innerWidth - viewportPadding) {
      nextPlacement = 'left'
      left = rect.left - overlayWidth - offsetX
    }

    if (left < viewportPadding) {
      nextPlacement = 'right'
      left = rect.right + offsetX
    }

    left = clamp(left, viewportPadding, window.innerWidth - overlayWidth - viewportPadding)
    const top = clamp(rect.top + offsetY, viewportPadding, window.innerHeight - overlayHeight - viewportPadding)

    setPlacement(nextPlacement)
    setPosition({ top, left })
  }

  useEffect(() => {
    if (!rendered) return
    updatePosition()
    const update = () => updatePosition()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [rendered, settings.offsetX, settings.offsetY, settings.width])

  useEffect(() => {
    if (!rendered || !overlayRef.current) return
    updatePosition()
  }, [rendered])

  function openPreview() {
    if (!enabled || !canHover) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => {
      updatePosition()
      setRendered(true)
      requestAnimationFrame(() => setVisible(true))
    }, 70)
  }

  function closePreview() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setRendered(false), 190)
    }, 70)
  }

  const overlay =
    rendered && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={overlayRef}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: settings.width,
              maxWidth: 'min(360px, calc(100vw - 32px))',
              padding: settings.padding,
              background: settings.background,
              border: `1px solid ${settings.borderColor}`,
              boxShadow: settings.shadow,
              pointerEvents: 'none',
              zIndex: 120,
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'translateY(0px) scale(1)'
                : `translateY(10px) scale(0.985) rotate(${placement === 'right' ? '0.35deg' : '-0.35deg'})`,
              transformOrigin: placement === 'right' ? 'top left' : 'top right',
              transition: 'opacity 0.18s ease, transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: settings.accentColor }} />
            <div style={{ display: 'grid', gap: '12px' }}>
              {preview.image ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 3',
                    background: '#161616',
                    border: `1px solid ${settings.borderColor}`,
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.image}
                    alt={preview.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: preview.imagePosition ?? 'center',
                      transform: visible ? 'scale(1.03)' : 'scale(1)',
                      transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </div>
              ) : null}

              {preview.metadata && preview.metadata.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {preview.metadata.map((item) => (
                    <span
                      key={item}
                      className="font-mono"
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        color: settings.metaColor,
                        border: `1px solid ${settings.borderColor}`,
                        padding: '5px 8px',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="font-serif" style={{ fontSize: '24px', lineHeight: 1.05, color: settings.titleColor }}>
                {preview.title}
              </div>
              <div className="font-mono" style={{ fontSize: '14px', letterSpacing: '0.03em', lineHeight: 1.7, color: settings.bodyColor }}>
                {preview.body}
              </div>
              {preview.ctaLabel ? (
                <div className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.14em', color: settings.accentColor }}>
                  {preview.ctaLabel} <span className="arrow-nudge">→</span>
                </div>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <>
      <div ref={rootRef} onPointerEnter={openPreview} onPointerLeave={closePreview} style={{ height: '100%' }}>
        {children}
      </div>
      {overlay}
    </>
  )
}

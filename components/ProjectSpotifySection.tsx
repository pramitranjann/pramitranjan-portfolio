'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { resolveSpotifyReference } from '@/lib/spotify-reference'
import type { ListeningCardStyleSettings, ProjectSpotifyMedia } from '@/lib/site-content-schema'

const DEFAULT_SPOTIFY_CONTEXT = 'These songs encapsulate the mood and emotional texture of the work.'
const MIN_WIDGET_VIEWPORT_WIDTH = 768
const TRACK_EMBED_HEIGHT = 80
const PLAYLIST_EMBED_HEIGHT = 176
const DEFAULT_RESTING_LABEL = 'SONIC NOTE_'
const DEFAULT_RESTING_SUBCOPY = 'what I think this work sounds like'
const DEFAULT_HEADING = 'WHY THIS IS HERE'
const COLLAPSED_WIDGET_HEIGHT = 78

export function ProjectSpotifySection({
  spotify,
  listeningStyle,
}: {
  spotify?: ProjectSpotifyMedia
  listeningStyle?: ListeningCardStyleSettings
}) {
  const soundtrackReference = useMemo(
    () => resolveSpotifyReference(spotify?.soundtrack, 'track'),
    [spotify?.soundtrack],
  )
  const playlistReference = useMemo(
    () => resolveSpotifyReference(spotify?.playlist, 'playlist'),
    [spotify?.playlist],
  )
  const [showOnThisDevice, setShowOnThisDevice] = useState(false)
  const [activePlayer, setActivePlayer] = useState<'soundtrack' | 'playlist'>('soundtrack')
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null)
  const hoverOpenRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expandedPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShowOnThisDevice(window.innerWidth >= MIN_WIDGET_VIEWPORT_WIDTH)
  }, [])

  useEffect(() => {
    if (!soundtrackReference && playlistReference) {
      setActivePlayer('playlist')
    }
  }, [playlistReference, soundtrackReference])

  useEffect(() => {
    return () => {
      if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current)
      if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current)
    }
  }, [])

  const resolvedActivePlayer =
    activePlayer === 'playlist' && playlistReference ? 'playlist' : 'soundtrack'
  const activeReference =
    resolvedActivePlayer === 'playlist' ? playlistReference : soundtrackReference

  const contextCopy =
    spotify?.context?.trim() ||
    spotify?.playlist?.description?.trim() ||
    DEFAULT_SPOTIFY_CONTEXT
  const restingLabel = listeningStyle?.creativeWidgetRestingLabel?.trim() || DEFAULT_RESTING_LABEL
  const restingSubcopy =
    listeningStyle?.creativeWidgetRestingSubcopy?.trim() || DEFAULT_RESTING_SUBCOPY
  const heading = listeningStyle?.creativeWidgetHeading?.trim() || DEFAULT_HEADING
  const activeEmbedHeight =
    activeReference?.kind === 'playlist' ? PLAYLIST_EMBED_HEIGHT : TRACK_EMBED_HEIGHT
  const expandedWidth = activeReference?.kind === 'playlist'
      ? 'min(392px, calc(100vw - 48px))'
      : 'min(344px, calc(100vw - 48px))'

  useEffect(() => {
    if (typeof window === 'undefined') return
    const panel = expandedPanelRef.current
    if (!panel) return

    const updateHeight = () => {
      const nextHeight = Math.ceil(panel.getBoundingClientRect().height)
      setExpandedHeight(current => (current === nextHeight ? current : nextHeight))
    }

    updateHeight()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => updateHeight())
    observer.observe(panel)
    const frameId = window.requestAnimationFrame(updateHeight)

    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [activeEmbedHeight, contextCopy, resolvedActivePlayer, playlistReference, soundtrackReference])

  if (!showOnThisDevice) return null
  if (!soundtrackReference && !playlistReference) return null
  if (!activeReference) return null

  const handlePointerEnter = () => {
    if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current)
    if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current)
    hoverOpenRef.current = setTimeout(() => setIsExpanded(true), 40)
  }

  const handlePointerLeave = () => {
    if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current)
    if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current)
    hoverCloseRef.current = setTimeout(() => setIsExpanded(false), 110)
  }

  return (
    <aside
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 40,
        width: expandedWidth,
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setIsExpanded(true)}
      onBlur={() => setIsExpanded(false)}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isExpanded ? `${expandedHeight ?? activeEmbedHeight + 96}px` : `${COLLAPSED_WIDGET_HEIGHT}px`,
          transition: 'height 240ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            display: 'grid',
            gap: '8px',
            width: 'min(300px, calc(100vw - 48px))',
            padding: '11px 12px 12px',
            background: 'rgba(17, 17, 17, 0.96)',
            border: '1px solid var(--color-divider)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
            textAlign: 'left',
            cursor: 'pointer',
            opacity: isExpanded ? 0 : 1,
            transform: isExpanded ? 'scale(0.98) translateY(4px)' : 'scale(1) translateY(0px)',
            filter: isExpanded ? 'blur(2px)' : 'blur(0px)',
            pointerEvents: isExpanded ? 'none' : 'auto',
            transition: 'opacity 180ms ease-out, transform 220ms cubic-bezier(0.23, 1, 0.32, 1), filter 220ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '14px',
                height: '1px',
                background: 'var(--color-red)',
                flexShrink: 0,
              }}
            />
            <span
              className="font-mono"
              style={{
                color: 'var(--color-red)',
                fontSize: 'var(--text-eyebrow)',
                letterSpacing: '0.16em',
                whiteSpace: 'nowrap',
              }}
            >
              {restingLabel}
            </span>
          </div>
          <span
            className="font-mono"
            style={{
              color: 'var(--color-body)',
              fontSize: '12px',
              letterSpacing: '0.04em',
              lineHeight: 1.55,
              textWrap: 'pretty',
            }}
          >
            {restingSubcopy}
          </span>
        </button>
        <div
          ref={expandedPanelRef}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            display: 'grid',
            gap: '10px',
            padding: '12px',
            background: 'rgba(17, 17, 17, 0.96)',
            border: '1px solid var(--color-divider)',
            boxShadow: '0 20px 44px rgba(0,0,0,0.28), 0 0 0 1px rgba(245,242,237,0.03)',
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'scale(1.014) translateY(0px)' : 'scale(0.992) translateY(6px)',
            filter: isExpanded ? 'blur(0px)' : 'blur(2px)',
            pointerEvents: isExpanded ? 'auto' : 'none',
            transformOrigin: 'bottom right',
            willChange: 'transform, opacity, filter',
            transition: 'opacity 180ms ease-out, transform 220ms cubic-bezier(0.23, 1, 0.32, 1), filter 220ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <div style={{ padding: '1px 1px 3px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '14px',
                  height: '1px',
                  background: 'var(--color-red)',
                  flexShrink: 0,
                }}
              />
              <div
                className="font-mono"
                style={{
                  fontSize: 'var(--text-eyebrow)',
                  letterSpacing: '0.16em',
                  color: 'var(--color-red)',
                  whiteSpace: 'nowrap',
                }}
              >
                {heading}
              </div>
            </div>
            <p
              className="font-mono"
              style={{
                margin: 0,
                fontSize: '13px',
                letterSpacing: '0.04em',
                color: 'var(--color-body)',
                lineHeight: 1.6,
                textWrap: 'pretty',
              }}
            >
              {contextCopy}
            </p>
          </div>

          {soundtrackReference && playlistReference ? (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setActivePlayer('soundtrack')}
                className="font-mono"
                style={{
                  border: `1px solid ${resolvedActivePlayer === 'soundtrack' ? 'var(--color-frameborder)' : 'var(--color-divider)'}`,
                  background: resolvedActivePlayer === 'soundtrack' ? 'rgba(255,255,255,0.03)' : 'transparent',
                  color: resolvedActivePlayer === 'soundtrack' ? 'var(--color-heading)' : 'var(--color-label)',
                  padding: '8px 10px',
                  fontSize: 'var(--text-meta)',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                }}
              >
                SOUNDTRACK
              </button>
              <button
                type="button"
                onClick={() => setActivePlayer('playlist')}
                className="font-mono"
                style={{
                  border: `1px solid ${resolvedActivePlayer === 'playlist' ? 'var(--color-frameborder)' : 'var(--color-divider)'}`,
                  background: resolvedActivePlayer === 'playlist' ? 'rgba(255,255,255,0.03)' : 'transparent',
                  color: resolvedActivePlayer === 'playlist' ? 'var(--color-heading)' : 'var(--color-label)',
                  padding: '8px 10px',
                  fontSize: 'var(--text-meta)',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                }}
              >
                PLAYLIST
              </button>
            </div>
          ) : null}

          <div
            style={{
              paddingTop: '2px',
            }}
          >
            <iframe
              src={activeReference.embedUrl}
              loading="lazy"
              allow="encrypted-media"
              title={`${activeReference.kind} player`}
              style={{
                width: '100%',
                height: `${activeEmbedHeight}px`,
                border: 0,
                background: 'transparent',
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

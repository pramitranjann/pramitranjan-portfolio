'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveSpotifyReference } from '@/lib/spotify-reference'
import type { ProjectSpotifyMedia } from '@/lib/site-content-schema'

const DEFAULT_SPOTIFY_CONTEXT = 'These songs encapsulate the mood and emotional texture of the work.'
const MIN_WIDGET_VIEWPORT_WIDTH = 768
const TRACK_EMBED_HEIGHT = 80
const PLAYLIST_EMBED_HEIGHT = 152

export function ProjectSpotifySection({
  spotify,
}: {
  spotify?: ProjectSpotifyMedia
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShowOnThisDevice(window.innerWidth >= MIN_WIDGET_VIEWPORT_WIDTH)
  }, [])

  useEffect(() => {
    if (!soundtrackReference && playlistReference) {
      setActivePlayer('playlist')
    }
  }, [playlistReference, soundtrackReference])

  if (!showOnThisDevice) return null
  if (!soundtrackReference && !playlistReference) return null

  const resolvedActivePlayer =
    activePlayer === 'playlist' && playlistReference ? 'playlist' : 'soundtrack'
  const activeReference =
    resolvedActivePlayer === 'playlist' ? playlistReference : soundtrackReference

  if (!activeReference) return null

  const contextCopy =
    spotify?.context?.trim() ||
    spotify?.playlist?.description?.trim() ||
    DEFAULT_SPOTIFY_CONTEXT
  const activeEmbedHeight =
    activeReference.kind === 'playlist' ? PLAYLIST_EMBED_HEIGHT : TRACK_EMBED_HEIGHT

  return (
    <aside
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: 40,
        width: 'min(352px, calc(100vw - 24px))',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '10px',
          padding: '12px',
          background: 'rgba(17, 17, 17, 0.96)',
          border: '1px solid var(--color-divider)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
        }}
      >
        <div style={{ padding: '1px 1px 3px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '14px',
                height: '1px',
                background: 'var(--color-red)',
              }}
            />
            <div className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.16em', color: 'var(--color-red)' }}>
              WHY THIS IS HERE
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

        <div style={{ paddingTop: '2px' }}>
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
    </aside>
  )
}

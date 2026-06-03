'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveSpotifyReference } from '@/lib/spotify-reference'
import type { ProjectSpotifyMedia } from '@/lib/site-content-schema'

const DEFAULT_SPOTIFY_CONTEXT = 'These songs encapsulate the mood and emotional texture of the work.'
const MIN_WIDGET_VIEWPORT_WIDTH = 768

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

  return (
    <aside
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: 40,
        width: 'min(320px, calc(100vw - 24px))',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '8px',
          padding: '10px',
          background: 'rgba(12, 12, 12, 0.94)',
          border: '1px solid #242424',
          boxShadow: '0 1px 0 rgba(255,49,32,0.18) inset, 0 14px 40px rgba(0,0,0,0.24), 0 0 28px rgba(255,49,32,0.08)',
        }}
      >
        <div style={{ padding: '1px 1px 5px' }}>
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
                background: 'rgba(255,49,32,0.8)',
                boxShadow: '0 0 12px rgba(255,49,32,0.28)',
              }}
            />
            <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#ff6a5c' }}>
              WHY THIS IS HERE
            </div>
          </div>
          <p
            className="font-mono"
            style={{
              margin: 0,
              fontSize: '10px',
              letterSpacing: '0.035em',
              color: '#f0b2ab',
              lineHeight: 1.7,
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
                border: `1px solid ${resolvedActivePlayer === 'soundtrack' ? '#3a3a3a' : '#242424'}`,
                background: resolvedActivePlayer === 'soundtrack' ? '#151515' : 'transparent',
                color: resolvedActivePlayer === 'soundtrack' ? '#f5f2ed' : '#8f8f8f',
                padding: '7px 9px',
                fontSize: '9px',
                letterSpacing: '0.14em',
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
                border: `1px solid ${resolvedActivePlayer === 'playlist' ? '#3a3a3a' : '#242424'}`,
                background: resolvedActivePlayer === 'playlist' ? '#151515' : 'transparent',
                color: resolvedActivePlayer === 'playlist' ? '#f5f2ed' : '#8f8f8f',
                padding: '7px 9px',
                fontSize: '9px',
                letterSpacing: '0.14em',
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
              height: '132px',
              border: 0,
              background: 'transparent',
            }}
          />
        </div>
      </div>
    </aside>
  )
}

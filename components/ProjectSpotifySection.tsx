'use client'

import { useEffect, useMemo, useState } from 'react'
import { playNav } from '@/lib/sounds'
import { resolveSpotifyReference } from '@/lib/spotify-reference'
import type { ProjectSpotifyMedia } from '@/lib/site-content-schema'

interface SpotifyTrackSummary {
  kind: 'track'
  id: string
  title: string
  artist: string
  album: string
  coverArt: string | null
  externalUrl: string
  embedUrl: string
}

interface SpotifyPlaylistSummary {
  kind: 'playlist'
  id: string
  title: string
  description: string | null
  owner: string | null
  coverArt: string | null
  externalUrl: string
  embedUrl: string
}

const DEFAULT_SPOTIFY_CONTEXT = 'These songs encapsulate the mood and emotional texture of the work.'

function getReferenceQueryValue(value: ProjectSpotifyMedia['soundtrack'] | ProjectSpotifyMedia['playlist']) {
  return value?.spotifyUrl?.trim() || value?.spotifyId?.trim() || ''
}

function FloatingSpotifyEntry({
  label,
  title,
  subtitle,
  artwork,
  ctaLabel,
  href,
  selected = false,
  onSelect,
}: {
  label: string
  title: string
  subtitle?: string | null
  artwork?: string | null
  ctaLabel: string
  href: string
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={onSelect ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      } : undefined}
      style={{
        display: 'grid',
        gap: '12px',
        padding: '14px',
        background: '#111111',
        border: selected ? '1px solid #3a3a3a' : '1px solid #242424',
        cursor: onSelect ? 'pointer' : 'default',
      }}
    >
      <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.16em', color: '#666666' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: '12px', alignItems: 'start' }}>
        {artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork}
            alt=""
            aria-hidden="true"
            style={{
              width: '44px',
              height: '44px',
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#1a1a1a',
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: '44px',
              height: '44px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#151515',
            }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div
            className="font-serif"
            style={{
              fontSize: '17px',
              fontStyle: 'italic',
              fontWeight: 'var(--font-weight-serif)',
              color: '#f5f2ed',
              lineHeight: 1.15,
              textWrap: 'balance',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              className="font-mono"
              style={{
                marginTop: '5px',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: '#999999',
                lineHeight: 1.6,
                textTransform: 'uppercase',
              }}
            >
              {subtitle}
            </div>
          ) : null}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                event.stopPropagation()
                playNav()
              }}
              className="font-mono"
              style={{
                display: 'inline-block',
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: '#FF3120',
                textDecoration: 'none',
                alignSelf: 'center',
              }}
            >
              {ctaLabel} →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [soundtrack, setSoundtrack] = useState<SpotifyTrackSummary | null>(null)
  const [playlist, setPlaylist] = useState<SpotifyPlaylistSummary | null>(null)
  const [activePlayer, setActivePlayer] = useState<'soundtrack' | 'playlist'>('soundtrack')

  useEffect(() => {
    const soundtrackQuery = getReferenceQueryValue(spotify?.soundtrack)
    const playlistQuery = getReferenceQueryValue(spotify?.playlist)
    if (!soundtrackQuery && !playlistQuery) return

    const controller = new AbortController()
    const searchParams = new URLSearchParams()
    if (soundtrackQuery) searchParams.set('soundtrack', soundtrackQuery)
    if (playlistQuery) searchParams.set('playlist', playlistQuery)

    fetch(`/api/spotify/media?${searchParams.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload) return
        setSoundtrack(payload.soundtrack ?? null)
        setPlaylist(payload.playlist ?? null)
      })
      .catch(() => null)

    return () => controller.abort()
  }, [spotify?.playlist, spotify?.soundtrack])

  if (!soundtrackReference && !playlistReference) {
    return null
  }

  const soundtrackOpenUrl = soundtrack?.externalUrl ?? soundtrackReference?.openUrl
  const playlistOpenUrl = playlist?.externalUrl ?? playlistReference?.openUrl
  const soundtrackEmbedUrl = soundtrack?.embedUrl ?? soundtrackReference?.embedUrl
  const playlistEmbedUrl = playlist?.embedUrl ?? playlistReference?.embedUrl
  const contextCopy =
    spotify?.context?.trim() ||
    spotify?.playlist?.description?.trim() ||
    DEFAULT_SPOTIFY_CONTEXT
  const hasSoundtrack = Boolean(soundtrackOpenUrl)
  const hasPlaylist = Boolean(playlistOpenUrl)
  const resolvedActivePlayer = activePlayer === 'playlist' && hasPlaylist ? 'playlist' : 'soundtrack'
  const activeEmbedUrl = resolvedActivePlayer === 'playlist' ? playlistEmbedUrl : soundtrackEmbedUrl
  const activeEmbedTitle = resolvedActivePlayer === 'playlist'
    ? `${playlist?.title ?? 'Spotify playlist'} player`
    : `${soundtrack?.title ?? 'Spotify soundtrack'} player`

  useEffect(() => {
    if (!hasSoundtrack && hasPlaylist) {
      setActivePlayer('playlist')
    }
  }, [hasPlaylist, hasSoundtrack])

  return (
    <aside
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: 40,
        width: 'min(360px, calc(100vw - 24px))',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '10px',
          padding: '12px',
          background: 'rgba(12, 12, 12, 0.94)',
          border: '1px solid #242424',
          boxShadow: '0 14px 40px rgba(0,0,0,0.24)',
        }}
      >
        <div
          style={{
            padding: '2px 2px 6px',
          }}
        >
          <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.16em', color: '#666666', marginBottom: '8px' }}>
            WHY THIS IS HERE
          </div>
          <p
            className="font-mono"
            style={{
              margin: 0,
              fontSize: '11px',
              letterSpacing: '0.03em',
              color: '#b4b4b4',
              lineHeight: 1.7,
              textWrap: 'pretty',
            }}
          >
            {contextCopy}
          </p>
        </div>

        {activeEmbedUrl ? (
          hasSoundtrack && hasPlaylist ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActivePlayer('soundtrack')}
                className="font-mono"
                style={{
                  border: `1px solid ${resolvedActivePlayer === 'soundtrack' ? '#3a3a3a' : '#242424'}`,
                  background: resolvedActivePlayer === 'soundtrack' ? '#151515' : 'transparent',
                  color: resolvedActivePlayer === 'soundtrack' ? '#f5f2ed' : '#8f8f8f',
                  padding: '8px 10px',
                  fontSize: '10px',
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
                  padding: '8px 10px',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  cursor: 'pointer',
                }}
              >
                PLAYLIST
              </button>
            </div>
          ) : null
        ) : (
          <>
            {hasSoundtrack ? (
              <FloatingSpotifyEntry
                label="Soundtrack"
                title={soundtrack?.title ?? 'Spotify soundtrack'}
                subtitle={soundtrack?.artist ?? null}
                artwork={soundtrack?.coverArt ?? null}
                ctaLabel="Listen on Spotify"
                href={soundtrackOpenUrl!}
                selected={resolvedActivePlayer === 'soundtrack'}
                onSelect={soundtrackEmbedUrl && hasPlaylist ? () => setActivePlayer('soundtrack') : undefined}
              />
            ) : null}

            {hasPlaylist ? (
              <FloatingSpotifyEntry
                label="Playlist"
                title={playlist?.title ?? 'Spotify playlist'}
                subtitle={spotify?.playlist?.description ?? playlist?.description ?? playlist?.owner ?? null}
                artwork={playlist?.coverArt ?? null}
                ctaLabel="Open playlist"
                href={playlistOpenUrl!}
                selected={resolvedActivePlayer === 'playlist'}
                onSelect={playlistEmbedUrl && hasSoundtrack ? () => setActivePlayer('playlist') : undefined}
              />
            ) : null}
          </>
        )}

        {activeEmbedUrl ? (
          <div
            style={{
              paddingTop: '2px',
            }}
          >
            <iframe
              src={activeEmbedUrl}
              loading="lazy"
              allow="encrypted-media"
              title={activeEmbedTitle}
              style={{
                width: '100%',
                height: '152px',
                border: 0,
                background: 'transparent',
              }}
            />
          </div>
        ) : null}
      </div>
    </aside>
  )
}

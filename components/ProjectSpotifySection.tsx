'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

function getReferenceQueryValue(value: ProjectSpotifyMedia['soundtrack'] | ProjectSpotifyMedia['playlist']) {
  return value?.spotifyUrl?.trim() || value?.spotifyId?.trim() || ''
}

function SpotifyMediaCard({
  label,
  title,
  subtitle,
  description,
  artwork,
  openLabel,
  openUrl,
  embedUrl,
  embedTitle,
  embedHeight,
  shouldLoadEmbed,
}: {
  label: string
  title: string
  subtitle?: string | null
  description?: string | null
  artwork?: string | null
  openLabel: string
  openUrl: string
  embedUrl: string
  embedTitle: string
  embedHeight: number
  shouldLoadEmbed: boolean
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '14px',
        padding: '14px',
        background: '#111111',
        border: '1px solid #1f1f1f',
        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.16em', color: '#666666' }}>
        {label.toUpperCase()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '56px minmax(0, 1fr)', gap: '12px', alignItems: 'start' }}>
        {artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork}
            alt=""
            aria-hidden="true"
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#1a1a1a',
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: '56px',
              height: '56px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#151515',
            }}
          />
        )}

        <div style={{ minWidth: 0 }}>
          <div
            className="font-serif"
            style={{
              fontSize: '18px',
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
          {description ? (
            <p
              className="font-mono"
              style={{
                margin: '9px 0 0',
                fontSize: '11px',
                letterSpacing: '0.03em',
                color: '#7d7d7d',
                lineHeight: 1.7,
                textWrap: 'pretty',
              }}
            >
              {description}
            </p>
          ) : null}
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            onClick={playNav}
            className="font-mono"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: '#FF3120',
              textDecoration: 'none',
            }}
          >
            {openLabel} →
          </a>
        </div>
      </div>

      {shouldLoadEmbed ? (
        <iframe
          src={embedUrl}
          loading="lazy"
          allow="encrypted-media"
          title={embedTitle}
          style={{
            width: '100%',
            height: `${embedHeight}px`,
            border: 0,
            background: 'transparent',
          }}
        />
      ) : null}
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
  const [shouldLoadEmbed, setShouldLoadEmbed] = useState(false)
  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = sectionRef.current
    if (!node || shouldLoadEmbed) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShouldLoadEmbed(true)
        observer.disconnect()
      },
      { rootMargin: '160px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldLoadEmbed])

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

  return (
    <div
      ref={sectionRef}
      style={{
        display: 'grid',
        gap: '12px',
        width: 'min(100%, 720px)',
        marginTop: '28px',
      }}
    >
      {soundtrackReference && soundtrackOpenUrl && soundtrackEmbedUrl ? (
        <SpotifyMediaCard
          label="Soundtrack"
          title={soundtrack?.title ?? 'Spotify soundtrack'}
          subtitle={soundtrack?.artist ?? null}
          artwork={soundtrack?.coverArt ?? null}
          openLabel="Listen on Spotify"
          openUrl={soundtrackOpenUrl}
          embedUrl={soundtrackEmbedUrl}
          embedTitle={`${soundtrack?.title ?? 'Spotify soundtrack'} embed`}
          embedHeight={152}
          shouldLoadEmbed={shouldLoadEmbed}
        />
      ) : null}

      {playlistReference && playlistOpenUrl && playlistEmbedUrl ? (
        <SpotifyMediaCard
          label="Playlist"
          title={playlist?.title ?? 'Spotify playlist'}
          subtitle={playlist?.owner ? `Curated by ${playlist.owner}` : null}
          description={spotify?.playlist?.description ?? playlist?.description ?? null}
          artwork={playlist?.coverArt ?? null}
          openLabel="Open playlist"
          openUrl={playlistOpenUrl}
          embedUrl={playlistEmbedUrl}
          embedTitle={`${playlist?.title ?? 'Spotify playlist'} embed`}
          embedHeight={152}
          shouldLoadEmbed={shouldLoadEmbed}
        />
      ) : null}
    </div>
  )
}

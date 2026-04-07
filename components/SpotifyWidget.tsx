'use client'
import { useEffect, useRef, useState } from 'react'
import type { ListeningCardStyleSettings } from '@/lib/site-content-schema'
import { playNav } from '@/lib/sounds'

interface Track {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string | null
  externalUrl: string | null
  spotifyUri?: string | null
  progress?: number
  duration?: number
}

interface SpotifyWidgetProps {
  variant: 'sidebar' | 'cell'
  restingLabel?: string
  styleSettings?: ListeningCardStyleSettings
  interactionMode?: 'static' | 'hover-expand'
}

const HOVER_QUERY = '(hover: hover) and (pointer: fine)'

export function SpotifyWidget({ variant, restingLabel, styleSettings, interactionMode = 'static' }: SpotifyWidgetProps) {
  const [track, setTrack] = useState<Track | null>(null)
  const [liveProgress, setLiveProgress] = useState<number | undefined>(undefined)
  const [canHover, setCanHover] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hoverOpenRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const fetch_ = () =>
      fetch('/api/spotify')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && !data.error) {
            setTrack(data)
            setLiveProgress(data.progress)
          }
        })
        .catch(() => null)

    fetch_()
    const id = setInterval(fetch_, 30_000)
    return () => clearInterval(id)
  }, [])

  // Tick liveProgress every second when playing
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (track?.isPlaying && track.duration !== undefined) {
      tickRef.current = setInterval(() => {
        setLiveProgress(prev => {
          if (prev === undefined || track.duration === undefined) return prev
          return Math.min(prev + 1000, track.duration)
        })
      }, 1000)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [track?.isPlaying, track?.duration, track?.title])

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
      if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current)
      if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current)
    }
  }, [])

  if (!track) return null  // parent renders static content as fallback

  const progress = liveProgress ?? track.progress
  const pct = progress !== undefined && track.duration !== undefined
    ? Math.min(Math.round((progress / track.duration) * 100), 100)
    : 0
  const isInteractive = variant === 'sidebar' && interactionMode === 'hover-expand' && canHover

  const handlePointerEnter = isInteractive
    ? () => {
        if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current)
        if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current)
        hoverOpenRef.current = setTimeout(() => setIsHovered(true), 40)
      }
    : undefined

  const handlePointerLeave = isInteractive
    ? () => {
        if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current)
        if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current)
        hoverCloseRef.current = setTimeout(() => setIsHovered(false), 110)
      }
    : undefined

  return (
    <div
      style={{ width: '100%' }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {variant === 'cell' ? (
        <CellVariant track={track} pct={pct} restingLabel={restingLabel} styleSettings={styleSettings} />
      ) : (
        <SidebarVariant
          track={track}
          progress={progress}
          pct={pct}
          restingLabel={restingLabel}
          styleSettings={styleSettings}
          expanded={isInteractive && isHovered}
        />
      )}
    </div>
  )
}

function SidebarVariant({
  track,
  progress,
  pct,
  restingLabel,
  styleSettings,
  expanded = false,
}: {
  track: Track
  progress: number | undefined
  pct: number
  restingLabel?: string
  styleSettings?: ListeningCardStyleSettings
  expanded?: boolean
}) {
  return (
    <div
      style={{
        background: styleSettings?.cardBackground ?? '#111111',
        border: `1px solid ${styleSettings?.cardBorderColor ?? '#1f1f1f'}`,
        padding: expanded ? '17px' : (styleSettings?.cardPadding ?? '14px'),
        minHeight: expanded ? (styleSettings?.hoverMinHeight ?? '190px') : '110px',
        transform: expanded ? `scale(${styleSettings?.hoverScale ?? '1.018'})` : 'scale(1)',
        transformOrigin: 'center right',
        boxShadow: expanded ? '0 20px 44px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,242,237,0.04)' : 'none',
        transition: 'padding 220ms cubic-bezier(0.23, 1, 0.32, 1), min-height 240ms cubic-bezier(0.23, 1, 0.32, 1), transform 220ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 220ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: track.isPlaying ? (styleSettings?.activeDotColor ?? '#FF3120') : (styleSettings?.idleDotColor ?? '#444444'),
          animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
        }} />
        <span className="font-mono" style={{ fontSize: styleSettings?.labelSize ?? '11px', letterSpacing: '0.14em', color: styleSettings?.labelColor ?? '#666666' }}>
          {track.isPlaying ? 'NOW PLAYING' : restingLabel ?? 'LAST PLAYED'}
        </span>
      </div>
      <div className="flex" style={{ gap: expanded ? '16px' : '10px', alignItems: 'center', transition: 'gap 220ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
        {track.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.albumArt}
            alt={track.title}
            style={{
              width: expanded ? (styleSettings?.hoverArtworkSize ?? '92px') : (styleSettings?.artworkSize ?? '36px'),
              height: expanded ? (styleSettings?.hoverArtworkSize ?? '92px') : (styleSettings?.artworkSize ?? '36px'),
              objectFit: 'cover',
              border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}`,
              flexShrink: 0,
              transition: 'width 220ms cubic-bezier(0.23, 1, 0.32, 1), height 220ms cubic-bezier(0.23, 1, 0.32, 1), transform 220ms cubic-bezier(0.23, 1, 0.32, 1)',
              transform: expanded ? 'translateY(1px)' : 'translateY(0px)',
            }}
          />
        ) : (
          <div
            style={{
              width: expanded ? (styleSettings?.hoverArtworkSize ?? '92px') : (styleSettings?.artworkSize ?? '36px'),
              height: expanded ? (styleSettings?.hoverArtworkSize ?? '92px') : (styleSettings?.artworkSize ?? '36px'),
              background: styleSettings?.progressTrackColor ?? '#1f1f1f',
              border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}`,
              flexShrink: 0,
              transition: 'width 220ms cubic-bezier(0.23, 1, 0.32, 1), height 220ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="font-serif"
            style={{
              fontSize: expanded ? '22px' : (styleSettings?.titleSize ?? '15px'),
              fontStyle: 'italic',
              color: styleSettings?.titleColor ?? '#f5f2ed',
              whiteSpace: expanded ? 'normal' : 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: expanded ? 1.15 : 1.3,
              transition: 'font-size 220ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            {track.title}
          </div>
          <div className="font-mono" style={{ fontSize: styleSettings?.artistSize ?? '10px', letterSpacing: '0.1em', color: styleSettings?.artistColor ?? '#999999', marginTop: '3px' }}>
            {track.artist.toUpperCase()}
          </div>
          {expanded ? (
            <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.12em', color: styleSettings?.labelColor ?? '#666666', marginTop: '8px', lineHeight: 1.6 }}>
              {track.album.toUpperCase()}
            </div>
          ) : null}
        </div>
      </div>
      {track.isPlaying && (
        <>
          <div
            style={{
              marginTop: expanded ? '14px' : '10px',
              height: expanded ? (styleSettings?.hoverProgressHeight ?? '6px') : '1px',
              background: styleSettings?.progressTrackColor ?? '#1f1f1f',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: expanded ? '999px' : '0px',
              transition: 'height 220ms cubic-bezier(0.23, 1, 0.32, 1), border-radius 220ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${pct}%`,
                background: styleSettings?.progressFillColor ?? '#FF3120',
                boxShadow: expanded ? `0 0 14px ${styleSettings?.progressFillColor ?? '#FF3120'}` : 'none',
                transition: 'box-shadow 220ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            />
          </div>
        </>
      )}
      <div
        style={{
          marginTop: expanded ? '12px' : '0px',
          display: 'grid',
          gap: '10px',
          maxHeight: expanded ? '80px' : '0px',
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 240ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms ease-out, margin-top 220ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.05em', color: styleSettings?.artistColor ?? '#999999', lineHeight: 1.7 }}>
          {track.isPlaying
            ? (styleSettings?.hoverCopyPlaying ?? 'Proof the sidebar has better taste than most rooms.')
            : (styleSettings?.hoverCopyIdle ?? 'Between tracks, but the taste level is still intact.')}
        </div>
        {track.externalUrl ? (
          <a
            href={track.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono"
            onClick={playNav}
            style={{
              color: styleSettings?.progressFillColor ?? '#FF3120',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              width: 'fit-content',
            }}
          >
            OPEN IN SPOTIFY →
          </a>
        ) : null}
      </div>
    </div>
  )
}

function CellVariant({
  track,
  pct,
  restingLabel,
  styleSettings,
}: {
  track: Track
  pct: number
  restingLabel?: string
  styleSettings?: ListeningCardStyleSettings
}) {
  return (
    <div style={{ background: styleSettings?.cardBackground ?? '#0d0d0d', padding: styleSettings?.cardPadding ?? '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${styleSettings?.cardBorderColor ?? 'transparent'}` }}>
      <div>
        <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: track.isPlaying ? (styleSettings?.activeDotColor ?? '#FF3120') : (styleSettings?.idleDotColor ?? '#444444'),
            animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
          }} />
          <span className="font-mono" style={{ fontSize: styleSettings?.labelSize ?? '11px', letterSpacing: '0.14em', color: styleSettings?.labelColor ?? '#666666' }}>
            {track.isPlaying ? 'NOW PLAYING' : restingLabel ?? 'LAST PLAYED'}
          </span>
        </div>
        <div className="flex" style={{ gap: '12px', alignItems: 'center' }}>
          {track.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.albumArt} alt={track.title} style={{ width: styleSettings?.artworkSize ?? '36px', height: styleSettings?.artworkSize ?? '36px', objectFit: 'cover', border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}`, flexShrink: 0 }} />
          ) : (
            <div style={{ width: styleSettings?.artworkSize ?? '36px', height: styleSettings?.artworkSize ?? '36px', background: styleSettings?.progressTrackColor ?? '#1f1f1f', border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}`, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-serif" style={{ fontSize: styleSettings?.titleSize ?? '15px', fontStyle: 'italic', fontWeight: 'var(--font-weight-serif)', color: styleSettings?.titleColor ?? '#f5f2ed', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
              {track.title}
            </div>
            <div className="font-mono" style={{ fontSize: styleSettings?.artistSize ?? '10px', letterSpacing: '0.1em', color: styleSettings?.artistColor ?? '#999999', lineHeight: 1.5 }}>
              {track.artist.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      {track.isPlaying ? (
        <div style={{ marginTop: '12px' }}>
          <div style={{ height: '1px', background: styleSettings?.progressTrackColor ?? '#1f1f1f', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: styleSettings?.progressFillColor ?? '#FF3120' }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

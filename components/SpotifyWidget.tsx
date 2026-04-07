'use client'
import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ListeningCardStyleSettings } from '@/lib/site-content-schema'
import { playCardEnter, playNav } from '@/lib/sounds'

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
}

export function SpotifyWidget({ variant, restingLabel, styleSettings }: SpotifyWidgetProps) {
  const [track, setTrack] = useState<Track | null>(null)
  const [liveProgress, setLiveProgress] = useState<number | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayId = useId()

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
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (rootRef.current?.contains(target) || overlayRef.current?.contains(target)) return
      setIsOpen(false)
      playNav()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      playNav()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  if (!track) return null  // parent renders static content as fallback

  const progress = liveProgress ?? track.progress
  const pct = progress !== undefined && track.duration !== undefined
    ? Math.min(Math.round((progress / track.duration) * 100), 100)
    : 0

  const closeOverlay = () => {
    setIsOpen(false)
    playNav()
  }

  const toggleOverlay = () => {
    setIsOpen((current) => {
      const next = !current
      if (next) playCardEnter()
      else playNav()
      return next
    })
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 50 : 'auto' }}>
      <button
        type="button"
        onClick={toggleOverlay}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={overlayId}
        style={{
          width: '100%',
          display: 'block',
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        {variant === 'cell' ? (
          <CellVariant track={track} pct={pct} restingLabel={restingLabel} styleSettings={styleSettings} />
        ) : (
          <SidebarVariant track={track} progress={progress} pct={pct} restingLabel={restingLabel} styleSettings={styleSettings} />
        )}
      </button>

      <SpotifyOverlay
        id={overlayId}
        overlayRef={overlayRef}
        track={track}
        progress={progress}
        pct={pct}
        restingLabel={restingLabel}
        styleSettings={styleSettings}
        open={isOpen}
        onClose={closeOverlay}
      />
    </div>
  )
}

function SidebarVariant({
  track,
  progress,
  pct,
  restingLabel,
  styleSettings,
}: {
  track: Track
  progress: number | undefined
  pct: number
  restingLabel?: string
  styleSettings?: ListeningCardStyleSettings
}) {
  return (
    <div style={{ background: styleSettings?.cardBackground ?? '#111111', border: `1px solid ${styleSettings?.cardBorderColor ?? '#1f1f1f'}`, padding: styleSettings?.cardPadding ?? '14px' }}>
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
      <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
        {track.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt={track.title} style={{ width: styleSettings?.artworkSize ?? '36px', height: styleSettings?.artworkSize ?? '36px', objectFit: 'cover', border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}`, flexShrink: 0 }} />
        ) : (
          <div style={{ width: styleSettings?.artworkSize ?? '36px', height: styleSettings?.artworkSize ?? '36px', background: styleSettings?.progressTrackColor ?? '#1f1f1f', border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}`, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-serif" style={{ fontSize: styleSettings?.titleSize ?? '15px', fontStyle: 'italic', color: styleSettings?.titleColor ?? '#f5f2ed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </div>
          <div className="font-mono" style={{ fontSize: styleSettings?.artistSize ?? '10px', letterSpacing: '0.1em', color: styleSettings?.artistColor ?? '#999999', marginTop: '3px' }}>
            {track.artist.toUpperCase()}
          </div>
        </div>
      </div>
      {track.isPlaying && (
        <>
          <div style={{ marginTop: '10px', height: '1px', background: styleSettings?.progressTrackColor ?? '#1f1f1f', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: styleSettings?.progressFillColor ?? '#FF3120' }} />
          </div>
          <div className="flex justify-between" style={{ marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: styleSettings?.progressMetaSize ?? '7px', letterSpacing: '0.1em', color: styleSettings?.progressMetaColor ?? '#444444' }}>
              {progress ? formatMs(progress) : '0:00'}
            </span>
            <span className="font-mono" style={{ fontSize: styleSettings?.progressMetaSize ?? '7px', letterSpacing: '0.1em', color: styleSettings?.progressMetaColor ?? '#444444' }}>
              {track.duration ? formatMs(track.duration) : '0:00'}
            </span>
          </div>
        </>
      )}
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

const overlaySurfaceStyle = (styleSettings?: ListeningCardStyleSettings, open?: boolean): CSSProperties => ({
  position: 'absolute' as const,
  top: 'calc(100% + 12px)',
  right: 0,
  width: 'min(360px, calc(100vw - 32px))',
  maxWidth: 'calc(100vw - 32px)',
  background: styleSettings?.cardBackground ?? '#111111',
  border: `1px solid ${styleSettings?.cardBorderColor ?? '#1f1f1f'}`,
  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(245, 242, 237, 0.04)',
  padding: '16px',
  opacity: open ? 1 : 0,
  transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.985)',
  transformOrigin: 'top right',
  transition: 'opacity 0.2s ease, transform 0.24s ease',
  pointerEvents: open ? 'auto' : 'none',
  zIndex: 60,
})

const SpotifyOverlay = ({
  id,
  track,
  progress,
  pct,
  restingLabel,
  styleSettings,
  open,
  onClose,
  overlayRef,
}: {
  id: string
  track: Track
  progress: number | undefined
  pct: number
  restingLabel?: string
  styleSettings?: ListeningCardStyleSettings
  open: boolean
  onClose: () => void
  overlayRef: React.RefObject<HTMLDivElement | null>
}) => {
  return (
    <div
      id={id}
      ref={overlayRef}
      role="dialog"
      aria-label="Spotify track details"
      style={overlaySurfaceStyle(styleSettings, open)}
    >
      <div className="flex items-center justify-between" style={{ gap: '12px', marginBottom: '14px' }}>
        <div className="flex items-center" style={{ gap: '8px' }}>
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: track.isPlaying ? (styleSettings?.activeDotColor ?? '#FF3120') : (styleSettings?.idleDotColor ?? '#444444'),
              animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
            }}
          />
          <span className="font-mono" style={{ fontSize: styleSettings?.labelSize ?? '11px', letterSpacing: '0.14em', color: styleSettings?.labelColor ?? '#666666' }}>
            {track.isPlaying ? 'NOW PLAYING' : restingLabel ?? 'LAST PLAYED'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: styleSettings?.labelColor ?? '#666666',
            fontSize: '11px',
            letterSpacing: '0.14em',
          }}
        >
          CLOSE
        </button>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '88px minmax(0, 1fr)',
            gap: '14px',
            alignItems: 'center',
          }}
        >
          {track.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumArt}
              alt={track.title}
              style={{
                width: '88px',
                height: '88px',
                objectFit: 'cover',
                border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}`,
              }}
            />
          ) : (
            <div style={{ width: '88px', height: '88px', background: styleSettings?.progressTrackColor ?? '#1f1f1f', border: `1px solid ${styleSettings?.artworkBorderColor ?? '#2a2a2a'}` }} />
          )}

          <div style={{ minWidth: 0 }}>
            <div className="font-serif" style={{ fontSize: '24px', fontStyle: 'italic', fontWeight: 'var(--font-weight-serif)', color: styleSettings?.titleColor ?? '#f5f2ed', lineHeight: 1.15, marginBottom: '6px' }}>
              {track.title}
            </div>
            <div className="font-mono" style={{ fontSize: styleSettings?.artistSize ?? '10px', letterSpacing: '0.1em', color: styleSettings?.artistColor ?? '#999999', lineHeight: 1.6, marginBottom: '6px' }}>
              {track.artist.toUpperCase()}
            </div>
            <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.1em', color: styleSettings?.labelColor ?? '#666666', lineHeight: 1.6 }}>
              {track.album.toUpperCase()}
            </div>
          </div>
        </div>

        {track.isPlaying && track.duration ? (
          <div style={{ borderTop: `1px solid ${styleSettings?.cardBorderColor ?? '#1f1f1f'}`, paddingTop: '12px' }}>
            <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.12em', color: styleSettings?.labelColor ?? '#666666', marginBottom: '8px' }}>
              TRACK PROGRESS
            </div>
            <div style={{ height: '2px', background: styleSettings?.progressTrackColor ?? '#1f1f1f', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: styleSettings?.progressFillColor ?? '#FF3120', transition: 'width 0.45s linear' }} />
            </div>
            <div className="flex justify-between" style={{ marginTop: '8px' }}>
              <span className="font-mono" style={{ fontSize: styleSettings?.progressMetaSize ?? '9px', letterSpacing: '0.1em', color: styleSettings?.progressMetaColor ?? '#444444' }}>
                {progress ? formatMs(progress) : '0:00'}
              </span>
              <span className="font-mono" style={{ fontSize: styleSettings?.progressMetaSize ?? '9px', letterSpacing: '0.1em', color: styleSettings?.progressMetaColor ?? '#444444' }}>
                {formatMs(track.duration)}
              </span>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between" style={{ gap: '12px', marginTop: '2px' }}>
          <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.12em', color: styleSettings?.labelColor ?? '#666666' }}>
            {track.isPlaying ? 'LIVE LISTENING SURFACE' : 'RECENT LISTENING SURFACE'}
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
              }}
            >
              OPEN IN SPOTIFY →
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

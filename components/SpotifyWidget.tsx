'use client'
import { useEffect, useState, useRef } from 'react'
import type { ListeningCardStyleSettings } from '@/lib/site-content-schema'

interface Track {
  isPlaying: boolean
  title: string
  artist: string
  albumArt: string | null
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
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  if (!track) return null  // parent renders static content as fallback

  const progress = liveProgress ?? track.progress
  const pct = progress !== undefined && track.duration !== undefined
    ? Math.min(Math.round((progress / track.duration) * 100), 100)
    : 0

  if (variant === 'cell') return <CellVariant track={track} pct={pct} restingLabel={restingLabel} styleSettings={styleSettings} />
  return <SidebarVariant track={track} progress={progress} pct={pct} restingLabel={restingLabel} styleSettings={styleSettings} />
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
    <div style={{ background: '#111111', border: '1px solid #1f1f1f', padding: styleSettings?.cardPadding ?? '14px' }}>
      <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: track.isPlaying ? '#FF3120' : '#444444',
          animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
        }} />
        <span className="font-mono" style={{ fontSize: styleSettings?.labelSize ?? '11px', letterSpacing: '0.14em', color: '#666666' }}>
          {track.isPlaying ? 'NOW PLAYING' : restingLabel ?? 'LAST PLAYED'}
        </span>
      </div>
      <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
        {track.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt={track.title} style={{ width: styleSettings?.artworkSize ?? '36px', height: styleSettings?.artworkSize ?? '36px', objectFit: 'cover', border: '1px solid #2a2a2a', flexShrink: 0 }} />
        ) : (
          <div style={{ width: styleSettings?.artworkSize ?? '36px', height: styleSettings?.artworkSize ?? '36px', background: '#1f1f1f', border: '1px solid #2a2a2a', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-serif" style={{ fontSize: styleSettings?.titleSize ?? '15px', fontStyle: 'italic', color: '#f5f2ed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </div>
          <div className="font-mono" style={{ fontSize: styleSettings?.artistSize ?? '10px', letterSpacing: '0.1em', color: '#999999', marginTop: '3px' }}>
            {track.artist.toUpperCase()}
          </div>
        </div>
      </div>
      {track.isPlaying && (
        <>
          <div style={{ marginTop: '10px', height: '1px', background: '#1f1f1f', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#FF3120' }} />
          </div>
          <div className="flex justify-between" style={{ marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: styleSettings?.progressMetaSize ?? '7px', letterSpacing: '0.1em', color: '#444444' }}>
              {progress ? formatMs(progress) : '0:00'}
            </span>
            <span className="font-mono" style={{ fontSize: styleSettings?.progressMetaSize ?? '7px', letterSpacing: '0.1em', color: '#444444' }}>
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
  return <SidebarVariant track={track} progress={track.progress} pct={pct} restingLabel={restingLabel} styleSettings={styleSettings} />
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

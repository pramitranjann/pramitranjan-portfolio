'use client'
import { useEffect, useState, useRef } from 'react'

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
}

export function SpotifyWidget({ variant }: SpotifyWidgetProps) {
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

  if (variant === 'cell') return <CellVariant track={track} pct={pct} />
  return <SidebarVariant track={track} progress={progress} pct={pct} />
}

function SidebarVariant({ track, progress, pct }: { track: Track; progress: number | undefined; pct: number }) {
  return (
    <div style={{ background: '#111111', border: '1px solid #1f1f1f', padding: '14px' }}>
      <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: track.isPlaying ? '#FF3120' : '#444444',
          animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
        }} />
        <span className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.14em', color: '#666666' }}>
          {track.isPlaying ? 'NOW PLAYING' : 'LAST PLAYED'}
        </span>
      </div>
      <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
        {track.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt={track.title} style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1px solid #2a2a2a', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '36px', height: '36px', background: '#1f1f1f', border: '1px solid #2a2a2a', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#f5f2ed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </div>
          <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#999999', marginTop: '2px' }}>
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
            <span className="font-mono" style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#444444' }}>
              {progress ? formatMs(progress) : '0:00'}
            </span>
            <span className="font-mono" style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#444444' }}>
              {track.duration ? formatMs(track.duration) : '0:00'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function CellVariant({ track, pct }: { track: Track; pct: number }) {
  return (
    <div>
      <div className="flex items-center" style={{ gap: '5px', marginBottom: '8px' }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: track.isPlaying ? '#FF3120' : '#444444',
          animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
          flexShrink: 0,
        }} />
        <span className="font-mono" style={{ fontSize: '7px', letterSpacing: '0.14em', color: '#666666' }}>
          {track.isPlaying ? 'LIVE' : 'LAST'}
        </span>
      </div>
      <div className="flex" style={{ gap: '8px', alignItems: 'flex-start' }}>
        {track.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt={track.title} style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid #2a2a2a', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '32px', height: '32px', background: '#1f1f1f', border: '1px solid #2a2a2a', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#f5f2ed', lineHeight: 1.2, marginBottom: '3px' }}>
            {track.title}
          </div>
          <div className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.1em', color: '#999999' }}>
            {track.artist.toUpperCase()}
          </div>
        </div>
      </div>
      {track.isPlaying && (
        <div style={{ height: '1px', background: '#1f1f1f', position: 'relative', marginTop: '8px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#FF3120' }} />
        </div>
      )}
    </div>
  )
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// app/api/spotify/route.ts
import { NextResponse } from 'next/server'

interface SpotifyTrack {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string | null
  progress?: number
  duration?: number
}

async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
  })
  const data = await res.json()
  return data.access_token
}

async function getLastPlayed(token: string): Promise<NextResponse> {
  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })
  const data = await res.json()
  const item = data?.items?.[0]?.track
  if (!item) return NextResponse.json({ error: 'no data' }, { status: 404 })

  const track: SpotifyTrack = {
    isPlaying: false,
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(', '),
    album: item.album.name,
    albumArt: item.album.images?.[1]?.url ?? item.album.images?.[0]?.url ?? null,
  }
  return NextResponse.json(track)
}

export async function GET() {
  try {
    const token = await getAccessToken()

    const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    })

    if (nowRes.status === 204) {
      return getLastPlayed(token)
    }

    const now = await nowRes.json()
    if (!now?.item) return getLastPlayed(token)

    const track: SpotifyTrack = {
      isPlaying: now.is_playing,
      title: now.item.name,
      artist: now.item.artists.map((a: { name: string }) => a.name).join(', '),
      album: now.item.album.name,
      albumArt: now.item.album.images?.[1]?.url ?? now.item.album.images?.[0]?.url ?? null,
      progress: now.progress_ms,
      duration: now.item.duration_ms,
    }
    return NextResponse.json(track)
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

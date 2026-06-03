import 'server-only'

import { resolveSpotifyReference, type ResolvedSpotifyReference, type SpotifyReferenceInput } from '@/lib/spotify-reference'

export interface SpotifyNowPlayingTrack {
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

export interface SpotifyTrackSummary {
  kind: 'track'
  id: string
  title: string
  artist: string
  album: string
  coverArt: string | null
  externalUrl: string
  embedUrl: string
}

export interface SpotifyPlaylistSummary {
  kind: 'playlist'
  id: string
  title: string
  description: string | null
  owner: string | null
  coverArt: string | null
  externalUrl: string
  embedUrl: string
}

function pickImage(images: Array<{ url?: string }> | undefined) {
  return images?.[1]?.url ?? images?.[0]?.url ?? null
}

function stripSpotifyDescription(value: string | undefined) {
  if (!value) return null

  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim() || null
}

async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
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
  if (!res.ok || !data.access_token) {
    throw new Error(`Spotify token error: ${data?.error ?? res.status}`)
  }
  return data.access_token
}

async function fetchSpotifyJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Spotify API error (${res.status}) for ${url}`)
  }

  return res.json() as Promise<T>
}

async function getLastPlayedTrack(token: string): Promise<SpotifyNowPlayingTrack> {
  const data = await fetchSpotifyJson<{
    items?: Array<{
      track?: {
        name: string
        artists: Array<{ name: string }>
        album: { name: string; images?: Array<{ url?: string }> }
        external_urls?: { spotify?: string }
        uri?: string
      }
    }>
  }>('https://api.spotify.com/v1/me/player/recently-played?limit=1', token)

  const item = data.items?.[0]?.track
  if (!item) {
    throw new Error('Spotify recently-played returned no track')
  }

  return {
    isPlaying: false,
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(', '),
    album: item.album.name,
    albumArt: pickImage(item.album.images),
    externalUrl: item.external_urls?.spotify ?? null,
    spotifyUri: item.uri ?? null,
  }
}

function trackSummaryFromReference(
  reference: ResolvedSpotifyReference,
  item: {
    name: string
    artists: Array<{ name: string }>
    album: { name: string; images?: Array<{ url?: string }> }
    external_urls?: { spotify?: string }
  },
): SpotifyTrackSummary {
  return {
    kind: 'track',
    id: reference.id,
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(', '),
    album: item.album.name,
    coverArt: pickImage(item.album.images),
    externalUrl: item.external_urls?.spotify ?? reference.openUrl,
    embedUrl: reference.embedUrl,
  }
}

export async function getCurrentOrLastPlayedTrack(): Promise<SpotifyNowPlayingTrack> {
  const token = await getAccessToken()

  const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })

  if (nowRes.status === 204) {
    return getLastPlayedTrack(token)
  }

  if (!nowRes.ok) {
    throw new Error(`Spotify currently-playing error: ${nowRes.status}`)
  }

  const now = await nowRes.json() as {
    is_playing: boolean
    progress_ms?: number
    item?: {
      name: string
      duration_ms?: number
      artists: Array<{ name: string }>
      album: { name: string; images?: Array<{ url?: string }> }
      external_urls?: { spotify?: string }
      uri?: string
    }
  }

  if (!now.item) {
    return getLastPlayedTrack(token)
  }

  return {
    isPlaying: now.is_playing,
    title: now.item.name,
    artist: now.item.artists.map((artist) => artist.name).join(', '),
    album: now.item.album.name,
    albumArt: pickImage(now.item.album.images),
    externalUrl: now.item.external_urls?.spotify ?? null,
    spotifyUri: now.item.uri ?? null,
    progress: now.progress_ms,
    duration: now.item.duration_ms,
  }
}

export async function getSpotifyTrackSummary(
  input: SpotifyReferenceInput | undefined,
): Promise<SpotifyTrackSummary | null> {
  const reference = resolveSpotifyReference(input, 'track')
  if (!reference) return null

  const token = await getAccessToken()
  const item = await fetchSpotifyJson<{
    name: string
    artists: Array<{ name: string }>
    album: { name: string; images?: Array<{ url?: string }> }
    external_urls?: { spotify?: string }
  }>(`https://api.spotify.com/v1/tracks/${reference.id}`, token)

  return trackSummaryFromReference(reference, item)
}

export async function getSpotifyPlaylistSummary(
  input: SpotifyReferenceInput | undefined,
): Promise<SpotifyPlaylistSummary | null> {
  const reference = resolveSpotifyReference(input, 'playlist')
  if (!reference) return null

  const token = await getAccessToken()
  const item = await fetchSpotifyJson<{
    name: string
    description?: string
    images?: Array<{ url?: string }>
    external_urls?: { spotify?: string }
    owner?: { display_name?: string }
  }>(`https://api.spotify.com/v1/playlists/${reference.id}`, token)

  return {
    kind: 'playlist',
    id: reference.id,
    title: item.name,
    description: stripSpotifyDescription(item.description),
    owner: item.owner?.display_name ?? null,
    coverArt: pickImage(item.images),
    externalUrl: item.external_urls?.spotify ?? reference.openUrl,
    embedUrl: reference.embedUrl,
  }
}

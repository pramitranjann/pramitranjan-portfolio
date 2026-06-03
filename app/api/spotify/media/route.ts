import { NextRequest, NextResponse } from 'next/server'
import { getSpotifyPlaylistSummary, getSpotifyTrackSummary } from '@/lib/spotify'

function toReferenceInput(value: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  return trimmed.startsWith('http') || trimmed.startsWith('spotify:')
    ? { spotifyUrl: trimmed }
    : { spotifyId: trimmed }
}

export async function GET(request: NextRequest) {
  try {
    const soundtrack = toReferenceInput(request.nextUrl.searchParams.get('soundtrack'))
    const playlist = toReferenceInput(request.nextUrl.searchParams.get('playlist'))

    const [soundtrackData, playlistData] = await Promise.all([
      getSpotifyTrackSummary(soundtrack),
      getSpotifyPlaylistSummary(playlist),
    ])

    return NextResponse.json(
      {
        soundtrack: soundtrackData,
        playlist: playlistData,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('[spotify media]', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

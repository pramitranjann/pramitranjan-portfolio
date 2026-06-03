import { NextResponse } from 'next/server'
import { getCurrentOrLastPlayedTrack } from '@/lib/spotify'

export async function GET() {
  try {
    const track = await getCurrentOrLastPlayedTrack()
    return NextResponse.json(track, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[spotify]', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

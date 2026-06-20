import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { OWNER_ID } from '@/lib/life/constants'
import { getSupabaseAdmin } from '@/lib/life/supabase'

async function getStoredEntry(entryId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('entries')
    .select('id')
    .eq('user_id', OWNER_ID)
    .eq('id', entryId)
    .maybeSingle<{ id: string }>()

  if (error) throw error
  return data
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ entryId: string }> },
) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const { entryId } = await context.params

  try {
    const stored = await getStoredEntry(entryId)
    if (!stored) {
      return NextResponse.json({ error: 'Entry not found.' }, { status: 404 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', OWNER_ID)
      .eq('id', entryId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Entry deletion failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

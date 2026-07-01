import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { deleteStudioItem } from '@/lib/life/studio'

export async function DELETE(request: NextRequest, context: { params: Promise<unknown> }) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const { itemId } = (await context.params) as { itemId: string }

  try {
    await deleteStudioItem(itemId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete Studio item.' }, { status: 500 })
  }
}


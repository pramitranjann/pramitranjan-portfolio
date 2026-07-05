import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { getPersonById, updatePerson } from '@/lib/life/people'

export async function GET(request: NextRequest, context: { params: Promise<unknown> }) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const { personId } = (await context.params) as { personId: string }

  try {
    const person = await getPersonById(personId)
    if (!person) {
      return NextResponse.json({ error: 'Person not found.' }, { status: 404 })
    }
    return NextResponse.json({ person })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load person.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<unknown> }) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const { personId } = (await context.params) as { personId: string }

  try {
    const body = (await request.json().catch(() => null)) as {
      name?: string
      role?: string | null
      relationship?: string
      why?: string | null
      channel?: string | null
      cadenceDays?: number | null
      archived?: boolean
    } | null

    const person = await updatePerson(personId, {
      name: body?.name,
      relationship: body?.relationship,
      archived: body?.archived,
      ...(body && 'role' in body ? { role: body.role } : {}),
      ...(body && 'why' in body ? { why: body.why } : {}),
      ...(body && 'channel' in body ? { channel: body.channel } : {}),
      ...(body && 'cadenceDays' in body ? { cadenceDays: body.cadenceDays } : {}),
    })

    return NextResponse.json({ person })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update person.' }, { status: 500 })
  }
}

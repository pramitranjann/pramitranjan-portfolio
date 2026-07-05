import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { createPerson, listPeople } from '@/lib/life/people'

export async function GET(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  try {
    const includeArchived = request.nextUrl.searchParams.get('archived') === 'true'
    const people = await listPeople({ includeArchived })
    return NextResponse.json({ people })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load people.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      name?: string
      role?: string | null
      relationship?: string | null
      why?: string | null
      channel?: string | null
      cadenceDays?: number | null
    } | null

    if (!body?.name?.trim()) {
      return NextResponse.json({ error: 'Person name is required.' }, { status: 400 })
    }

    const person = await createPerson({
      name: body.name,
      role: body.role ?? null,
      relationship: body.relationship ?? null,
      why: body.why ?? null,
      channel: body.channel ?? null,
      cadenceDays: body.cadenceDays ?? null,
    })

    return NextResponse.json({ person })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create person.' }, { status: 500 })
  }
}

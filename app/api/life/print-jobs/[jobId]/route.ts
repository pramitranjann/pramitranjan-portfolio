import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { retryPrintJob } from '@/lib/life/print-jobs'

/** Retry a failed job (requeues it for another ESP32 attempt). */
export async function POST(
  request: NextRequest,
  context: { params: Promise<unknown> },
) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const { jobId } = (await context.params) as { jobId: string }

  try {
    const body = (await request.json().catch(() => null)) as { action?: string } | null
    const action = body?.action || 'retry'

    if (action !== 'retry') {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    const job = await retryPrintJob(jobId)
    return NextResponse.json({ job })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Retry failed.' },
      { status: 500 },
    )
  }
}

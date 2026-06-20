import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { hasValidAdminSession } from '@/lib/admin-auth'
import { constantTimeEqual } from '@/lib/security'
import { getLifeServerEnv } from '@/lib/life/env'

export function isAuthenticatedLifeRequest(request: NextRequest) {
  if (hasValidAdminSession(request)) {
    return true
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const presented = authHeader.slice('Bearer '.length)
  const env = getLifeServerEnv()
  if (constantTimeEqual(presented, env.cronSecret)) {
    return true
  }
  if (env.mobileToken && constantTimeEqual(presented, env.mobileToken)) {
    return true
  }
  return false
}

export function unauthorizedJson() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

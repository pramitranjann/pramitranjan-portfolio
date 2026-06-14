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

  return constantTimeEqual(authHeader.slice('Bearer '.length), getLifeServerEnv().cronSecret)
}

export function unauthorizedJson() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

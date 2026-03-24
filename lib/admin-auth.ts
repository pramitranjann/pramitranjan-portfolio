import 'server-only'

import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'portfolio_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14

function getAdminPassword() {
  const value = process.env.ADMIN_PASSWORD
  if (!value) throw new Error('ADMIN_PASSWORD is not set')
  return value
}

function getSessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not set')
  return value
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('hex')
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword()
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected))
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = `${expiresAt}`
  return `${payload}.${sign(payload)}`
}

export function isValidAdminSessionToken(token: string | undefined) {
  if (!token) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  if (sign(payload) !== signature) return false

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt)) return false

  return Date.now() < expiresAt
}

export async function isAdminSession() {
  const cookieStore = await cookies()
  return isValidAdminSessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export function getAdminCookieName() {
  return SESSION_COOKIE
}

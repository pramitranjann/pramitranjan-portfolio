'use client'

import { track } from '@vercel/analytics'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const REDIRECT_DELAY_MS = 4200
const TICK_MS = 100
const STATUS_LINES = [
  'Reading signal...',
  'Keeping it subtle...',
  'Opening portfolio...',
]

export function NfcCountdownClient() {
  const [remainingMs, setRemainingMs] = useState(REDIRECT_DELAY_MS)
  const hasTrackedView = useRef(false)
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasTrackedView.current) return
    hasTrackedView.current = true

    track('NFC Page Viewed', {
      hasReferrer: document.referrer.length > 0,
      viewportWidth: window.innerWidth,
    })
  }, [])

  useEffect(() => {
    const start = Date.now()

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start
      const nextRemaining = Math.max(0, REDIRECT_DELAY_MS - elapsed)
      setRemainingMs(nextRemaining)

      if (nextRemaining === 0 && !hasRedirected.current) {
        hasRedirected.current = true
        window.clearInterval(interval)
        track('NFC Auto Redirected', {
          redirectDelayMs: REDIRECT_DELAY_MS,
        })
        window.setTimeout(() => {
          window.location.replace('https://www.pramitranjan.com/')
        }, 120)
      }
    }, TICK_MS)

    return () => window.clearInterval(interval)
  }, [])

  const seconds = Math.max(1, Math.ceil(remainingMs / 1000))
  const progress = 1 - remainingMs / REDIRECT_DELAY_MS
  const statusIndex = Math.min(
    STATUS_LINES.length - 1,
    Math.floor(progress * STATUS_LINES.length)
  )

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          height: '1px',
          width: '100%',
          overflow: 'hidden',
          background: 'var(--color-divider)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${Math.min(progress * 100, 100)}%`,
            background: 'var(--color-red)',
            transition: 'width 100ms linear',
          }}
        />
      </div>

      <div
        className="font-mono"
        style={{
          display: 'grid',
          gap: '14px',
          fontSize: 'var(--text-meta)',
          letterSpacing: '0.12em',
          color: 'var(--color-body)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>REDIRECTING IN {seconds}S</span>
        <span style={{ color: 'var(--color-label)', letterSpacing: '0.04em', textTransform: 'none' }}>{STATUS_LINES[statusIndex]}</span>
        <div className="qr-actions-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            href="/"
            className="font-mono"
            onClick={() => {
              track('NFC Skip Clicked', {
                secondsRemaining: seconds,
              })
            }}
            style={{
              minHeight: '40px',
              padding: '10px 18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-red)',
              border: '1px solid var(--color-red)',
              textDecoration: 'none',
            }}
          >
            SKIP THE CEREMONY <span className="arrow-nudge" style={{ marginLeft: '8px' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

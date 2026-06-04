'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const REDIRECT_DELAY_MS = 4200
const TICK_MS = 100

export function QrCountdownClient() {
  const [remainingMs, setRemainingMs] = useState(REDIRECT_DELAY_MS)

  useEffect(() => {
    const start = Date.now()

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start
      const nextRemaining = Math.max(0, REDIRECT_DELAY_MS - elapsed)
      setRemainingMs(nextRemaining)

      if (nextRemaining === 0) {
        window.clearInterval(interval)
        window.location.replace('https://www.pramitranjan.com/')
      }
    }, TICK_MS)

    return () => window.clearInterval(interval)
  }, [])

  const seconds = Math.max(1, Math.ceil(remainingMs / 1000))
  const progress = 1 - remainingMs / REDIRECT_DELAY_MS

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
        <div className="qr-actions-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            href="/"
            className="font-mono"
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
            SKIP THE SUSPENSE <span className="arrow-nudge" style={{ marginLeft: '8px' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

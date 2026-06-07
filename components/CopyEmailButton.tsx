'use client'

import { useState } from 'react'

const RESET_DELAY_MS = 1800

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), RESET_DELAY_MS)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="font-mono"
      style={{
        color: 'var(--color-label)',
        border: '1px solid var(--color-divider)',
        background: 'rgba(255, 255, 255, 0.02)',
        textDecoration: 'none',
        minHeight: '40px',
        padding: '8px 12px',
        fontSize: 'var(--text-meta)',
        letterSpacing: '0.14em',
        lineHeight: 1,
        cursor: 'pointer',
      }}
    >
      {copied ? 'COPIED' : 'COPY'}
    </button>
  )
}

'use client'

import { useEffect, useState } from 'react'

const OPTIONS = [
  { id: 'paper', label: 'PAPER', swatch: 'var(--color-white)' },
  { id: 'red', label: 'RED', swatch: 'var(--color-red)' },
  { id: 'black', label: 'BLACK', swatch: 'var(--color-bg)' },
] as const

const STORAGE_KEY = 'pcard-panel'

export function PcardPanelTweaks() {
  const [active, setActive] = useState<string>('paper')

  useEffect(() => {
    setActive(localStorage.getItem(STORAGE_KEY) ?? 'paper')
  }, [])

  useEffect(() => {
    document.documentElement.dataset.pcardPanel = active
    localStorage.setItem(STORAGE_KEY, active)
  }, [active])

  return (
    <div
      className="font-mono"
      style={{
        position: 'fixed',
        left: '16px',
        bottom: '16px',
        zIndex: 90,
        display: 'flex',
        gap: '4px',
        padding: '8px',
        backgroundColor: '#141414',
        border: '1px solid var(--color-divider)',
      }}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setActive(option.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            letterSpacing: '0.14em',
            cursor: 'pointer',
            background: 'transparent',
            color: active === option.id ? 'var(--color-heading)' : 'var(--color-label)',
            border: `1px solid ${active === option.id ? 'var(--color-red)' : 'transparent'}`,
          }}
        >
          <span style={{ width: '10px', height: '10px', backgroundColor: option.swatch, border: '1px solid #2a2a2a' }} />
          {option.label}
        </button>
      ))}
    </div>
  )
}

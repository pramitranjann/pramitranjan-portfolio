'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DashboardLoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setError(data?.error ?? 'Login failed')
      setSubmitting(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
      <label className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#999999' }}>
        ADMIN PASSWORD
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{
            width: '100%',
            marginTop: '10px',
            background: '#111111',
            border: '1px solid #2a2a2a',
            color: '#f5f2ed',
            padding: '12px 14px',
            outline: 'none',
          }}
        />
      </label>
      {error ? (
        <p className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.08em' }}>
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="font-mono"
        style={{
          background: '#FF3120',
          color: '#0d0d0d',
          border: 'none',
          padding: '12px 16px',
          cursor: 'pointer',
          letterSpacing: '0.12em',
          fontSize: 'var(--text-meta)',
        }}
      >
        {submitting ? 'SIGNING IN...' : 'SIGN IN'}
      </button>
    </form>
  )
}

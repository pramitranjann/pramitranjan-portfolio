export function LifeLoginForm({ nextPath = '/life' }: { nextPath?: string }) {
  return (
    <form action="/api/admin/login" method="post" style={{ display: 'grid', gap: '16px' }}>
      <input type="hidden" name="nextPath" value={nextPath} />
      <label className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#999999' }}>
        ADMIN PASSWORD
        <input
          name="password"
          type="password"
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
      <button
        type="submit"
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
        SIGN IN
      </button>
    </form>
  )
}

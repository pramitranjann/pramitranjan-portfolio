export function Footer() {
  return (
    <footer
      className="font-mono"
      style={{ borderTop: '1px solid var(--color-cardborder)', padding: '12px 24px' }}
    >
      <span style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: 'var(--color-label)', lineHeight: 1.8 }}>
        Set in{' '}
        <span style={{ color: 'var(--color-body)' }}>DM Serif Display</span>
        {' '}and{' '}
        <span style={{ color: 'var(--color-body)' }}>DM Mono</span>
        . Built and designed between meals and gym sets. My mum thinks it looks nice. © 2026 PR_
      </span>
    </footer>
  )
}

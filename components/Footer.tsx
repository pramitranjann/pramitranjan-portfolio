export function Footer() {
  return (
    <footer
      className="font-mono flex items-center justify-between"
      style={{ borderTop: '1px solid var(--color-cardborder)', padding: '10px 24px' }}
    >
      <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--color-label)' }}>
        Designed between meals and gym sets. My mum thinks it looks nice. © 2026
      </span>
      <span style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#FF3120' }}>
        PR_
      </span>
    </footer>
  )
}

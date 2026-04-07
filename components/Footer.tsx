export function Footer() {
  return (
    <footer
      className="font-mono flex items-center justify-between"
      style={{ borderTop: '1px solid var(--footer-border-color)', padding: 'var(--layout-footer-padding-y) var(--layout-page-gutter)' }}
    >
      <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--footer-text-color)' }}>
        Designed between meals and gym sets. My mum thinks it looks nice. © 2026
      </span>
      <span style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'var(--footer-mark-color)' }}>
        PR_
      </span>
    </footer>
  )
}

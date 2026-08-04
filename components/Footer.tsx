export function Footer() {
  return (
    <footer
      className="site-footer font-mono flex items-center justify-between"
      style={{ borderTop: '1px solid var(--footer-border-color)', padding: 'var(--layout-footer-padding-y) var(--layout-page-gutter)', gap: '20px' }}
    >
      <span
        className="flex-1 min-w-0 text-balance"
        style={{ fontSize: '10px', lineHeight: 1.6, letterSpacing: '0.1em', color: 'var(--footer-text-color)' }}
      >
        Designed between meals and gym sets. My mum thinks it looks nice. © 2026
      </span>
      <span className="shrink-0 flex items-center" style={{ gap: '20px' }}>
        <a href="/lab" className="footer-link footer-link-secondary" style={{ fontSize: '10px', letterSpacing: '0.14em' }}>
          LAB_
        </a>
        <a href="/colophon" className="footer-link footer-link-secondary" style={{ fontSize: '10px', letterSpacing: '0.14em' }}>
          COLOPHON_
        </a>
        <span style={{ fontSize: '13px', letterSpacing: '0.14em', color: 'var(--footer-mark-color)' }}>
          PR
        </span>
      </span>
    </footer>
  )
}

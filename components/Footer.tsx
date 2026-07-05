export function Footer() {
  return (
    <footer
      className="font-mono grid gap-2 sm:flex sm:items-center sm:justify-between"
      style={{ borderTop: '1px solid var(--footer-border-color)', padding: 'var(--layout-footer-padding-y) var(--layout-page-gutter)' }}
    >
      <span
        className="min-w-0 text-pretty"
        style={{ fontSize: '10px', lineHeight: 1.6, letterSpacing: '0.1em', color: 'var(--footer-text-color)' }}
      >
        Designed between meals and gym sets. My mum thinks it looks nice. © 2026
      </span>
      <span className="justify-self-end shrink-0 flex items-center" style={{ gap: '20px' }}>
        <a href="/lab" className="footer-link" style={{ fontSize: '10px', letterSpacing: '0.14em' }}>
          LAB_
        </a>
        <a href="/colophon" className="footer-link" style={{ fontSize: '10px', letterSpacing: '0.14em' }}>
          COLOPHON_
        </a>
        <span style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'var(--footer-mark-color)' }}>
          PR_
        </span>
      </span>
    </footer>
  )
}

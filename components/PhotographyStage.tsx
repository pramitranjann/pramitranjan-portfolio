import Link from 'next/link'
import { FilmStrip } from './FilmStrip'

export function PhotographyStage() {
  return (
    <section>
      <div className="flex justify-between items-baseline" style={{ padding: '32px 24px 8px' }}>
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
          PHOTOGRAPHY
        </span>
        <Link href="/creative/photography" className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
          VIEW ALL →
        </Link>
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        <FilmStrip />
      </div>
    </section>
  )
}

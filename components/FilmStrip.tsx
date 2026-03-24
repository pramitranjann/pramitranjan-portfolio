import Image from 'next/image'
import Link from 'next/link'

const frames = [
  { label: 'KL · 001',   stock: '35mm',  width: 90, href: '/creative/photography/kl',        cover: '/creative/photography/kl/41.jpg' },
  { label: 'PG · 002',   stock: 'HP5+',  width: 66, href: '/creative/photography/penang',     cover: '/creative/photography/penang/07.jpg' },
  { label: 'SG · 003',   stock: 'X-TRA', width: 90, href: '/creative/photography/singapore',  cover: '/creative/photography/singapore/03.jpg' },
  { label: 'HCM · 004',  stock: '35mm',  width: 90, href: '/creative/photography/hcmc',       cover: '/creative/photography/hcmc/01.jpg' },
  { label: '',           stock: '',       width: 50, href: null,                               cover: null, faded: true },
]

function Holes() {
  return (
    <div className="flex" style={{ gap: '18px', padding: '0 12px' }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0"
          style={{
            width: '12px',
            height: '8px',
            backgroundColor: '#0d0d0d',
            border: '1px solid #1f1f1f',
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  )
}

export function FilmStrip() {
  return (
    <div style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '8px 0' }}>
      <Holes />

      <div className="flex" style={{ gap: '4px', padding: '6px 12px 6px 4px', overflow: 'hidden' }}>
        {frames.map((frame, i) => {
          const inner = (
            <div
              className="flex-shrink-0"
              style={{ opacity: frame.faded ? 0.3 : 1 }}
            >
              <div
                style={{
                  position: 'relative',
                  width: `${frame.width}px`,
                  height: '130px',
                  backgroundColor: '#161616',
                  border: '1px solid #222222',
                  overflow: 'hidden',
                }}
              >
                {frame.cover && (
                  <Image
                    src={frame.cover}
                    alt={frame.label}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="100px"
                  />
                )}
              </div>
              {!frame.faded && (
                <>
                  <div
                    className="font-mono"
                    style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#2a2a2a', textAlign: 'center', marginTop: '3px' }}
                  >
                    {frame.label}
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: '8px', letterSpacing: '0.08em', color: '#FF3120', textAlign: 'center' }}
                  >
                    {frame.stock}
                  </div>
                </>
              )}
            </div>
          )

          return frame.href ? (
            <Link key={i} href={frame.href} className="portfolio-card flex-shrink-0" style={{ display: 'block' }}>
              {inner}
            </Link>
          ) : (
            <div key={i}>{inner}</div>
          )
        })}
      </div>

      <Holes />
    </div>
  )
}

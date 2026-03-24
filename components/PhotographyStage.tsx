import Image from 'next/image'
import Link from 'next/link'

const FRAME_W = 124
const FRAME_H = 268
const SIDE_PAD = 12
const FRAME_GAP = 5
const HOLE_COUNT = 26

const frames = [
  { label: 'KL · 001',  href: '/creative/photography/kl',        cover: '/creative/photography/kl/41.jpg' },
  { label: 'KL · 002',  href: '/creative/photography/kl',        cover: '/creative/photography/kl/12.jpg' },
  { label: 'PG · 003',  href: '/creative/photography/penang',    cover: '/creative/photography/penang/07.jpg' },
  { label: 'SG · 004',  href: '/creative/photography/singapore', cover: '/creative/photography/singapore/03.jpg' },
  { label: 'HCM · 001', href: '/creative/photography/hcmc',      cover: '/creative/photography/hcmc/01.jpg' },
]

function Holes() {
  return (
    <div className="flex" style={{ gap: '14px', padding: `0 ${SIDE_PAD}px` }}>
      {Array.from({ length: HOLE_COUNT }).map((_, i) => (
        <div key={i} className="flex-shrink-0" style={{ width: '10px', height: '7px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: '2px' }} />
      ))}
    </div>
  )
}

export function PhotographyStage() {
  return (
    <section className="photography-section" style={{
      borderTop: '1px solid #1f1f1f',
      borderBottom: '1px solid #1f1f1f',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '480px',
      alignItems: 'stretch',
      padding: '64px 40px',
      gap: '56px',
    }}>
      {/* Text left */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="flex items-center" style={{ gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}>THE EYE CAME FIRST.</span>
          </div>
          <h2 className="font-serif" style={{ fontSize: 'var(--text-h2)', fontWeight: 400, fontStyle: 'italic', color: '#f5f2ed', lineHeight: 1.1, marginBottom: '24px' }}>
            Before <span style={{ color: '#FF3120' }}>Figma,</span><br />there was <span style={{ color: '#FF3120' }}>film.</span>
          </h2>
          <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.06em', color: '#999999', lineHeight: 1.9, maxWidth: '340px' }}>
            Street photography across Southeast Asia. Shot on 35mm and medium format. Always looking.
          </p>
        </div>
        <Link href="/creative/photography" className="font-mono" style={{ display: 'inline-block', marginTop: '24px', fontSize: '10px', color: '#FF3120', letterSpacing: '0.12em', textDecoration: 'none' }}>
          VIEW ALL →
        </Link>
      </div>

      {/* Film strip — hidden on mobile */}
      <div className="film-strip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{ backgroundColor: '#060606', padding: '14px 0', width: 'fit-content', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Holes />
          <div className="flex" style={{ gap: `${FRAME_GAP}px`, padding: `8px ${SIDE_PAD}px` }}>
            {frames.map((frame) => (
              <Link key={frame.label} href={frame.href} className="portfolio-card flex-shrink-0" style={{ display: 'block' }}>
                <div style={{ position: 'relative', width: `${FRAME_W}px`, height: `${FRAME_H}px`, backgroundColor: '#161616', border: '1px solid #222222', overflow: 'hidden' }}>
                  <Image
                    src={frame.cover}
                    alt={frame.label}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="124px"
                  />
                </div>
                <div className="font-mono" style={{ fontSize: '10px', color: '#FF3120', textAlign: 'center', marginTop: '4px', letterSpacing: '0.1em' }}>{frame.label}</div>
              </Link>
            ))}
          </div>
          <Holes />
        </div>
      </div>
    </section>
  )
}
